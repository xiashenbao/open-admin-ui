<template>
  <div>
    <Card shadow>
      <Form ref="searchForm"
            :model="pageInfo"
            inline
            :label-width="80">
        <FormItem label="AppId" prop="appId">
          <Input type="text" v-model="pageInfo.appId" placeholder="请输入关键字"/>
        </FormItem>
        <FormItem label="中文名称" prop="appName">
          <Input type="text" v-model="pageInfo.appName" placeholder="请输入关键字"/>
        </FormItem>
        <FormItem label="英文名称" prop="appName">
          <Input type="text" v-model="pageInfo.appNameEn" placeholder="请输入关键字"/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch(1)">查询</Button>&nbsp;
          <Button @click="handleResetForm('searchForm')">重置</Button>
        </FormItem>
      </Form>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button v-show="hasAuthority('systemAppEdit')"  class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;
            <span>添加</span>
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="userType" slot-scope="{ row }">
          <Tag color="blue" v-if="row.userType==='isp'">服务提供商</Tag>
          <Tag color="blue" v-else-if="row.userType==='dev'">自研开发者</Tag>
          <Tag color="blue" v-else="">平台</Tag>
        </template>
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="上线"/>
          <Badge v-else="" status="error" text="下线"/>
        </template>
        <template slot="appType" slot-scope="{ row }">
          <Tag color="blue" v-if="row.appType==='server'">服务器应用</Tag>
          <Tag color="blue" v-else-if="row.appType==='app'">手机应用</Tag>
          <Tag color="blue" v-else-if="row.appType==='pc'">PC网页应用</Tag>
          <Tag color="blue" v-else="">手机网页应用</Tag>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a v-show="hasAuthority('systemAppEdit')" @click="handleModal(row)" :disabled="row.appId === 'gateway' ?true:false">
            编辑</a>&nbsp;
          <Dropdown v-show="hasAuthority('systemAppEdit')" transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)" :disabled="row.appId === 'gateway' ?true:false">
              <span>更多</span>
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem  name="clientInfo">开发配置</DropdownItem>
              <DropdownItem  name="grantApi">接口授权</DropdownItem>
              <DropdownItem  name="resetSecret">重置密钥</DropdownItem>
              <DropdownItem  name="remove">删除应用</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>
      </Table>
      <Page transfer :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator
            show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           @on-cancel="handleReset"
           width="800">
      <Alert v-if="formItem.appId?true:false" show-icon>
        <span>重要信息,请妥善保管：AppId：</span>
        <Tag color="red">{{formItem.appId}}</Tag>
        <span>AppSecret：</span>
        <Tag color="red">{{formItem.appSecret}}</Tag>&nbsp;&nbsp;
        <a @click="handleResetSecret(formItem)">重置密钥</a>
      </Alert>
      <Form ref="form1" v-show="current=='form1'" :model="formItem" :rules="formItemRules" :label-width="135">
        <FormItem label="应用图标">
          <div class="upload-list" v-for="item in uploadList">
            <template v-if="item.status === 'finished'">
              <img :src="item.url">
              <div class="upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item.name)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemoveImg(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload"
            :show-upload-list="false"
            :default-file-list="defaultList"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//jsonplaceholder.typicode.com/posts/"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-camera" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="开发者" prop="userId">
          <Select v-model="formItem.userId" filterable clearable>
            <Option :title="item.userName" v-for="item in selectUsers" @click.native="handleOnSelectUser(item)"
                    :value="item.userId" :label="item.userName">
              <span>{{ item.userName }}</span>
              <span style="float: right">
                  <Tag color="blue" v-if="item.userType==='isp'">服务提供商</Tag>
                  <Tag color="blue" v-else-if="item.userType==='dev'">自研开发者</Tag>
                  <Tag color="blue" v-else="">平台</Tag>
                </span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="应用名称" prop="appName">
          <Input v-model="formItem.appName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="英文名称" prop="appNameEn">
          <Input v-model="formItem.appNameEn" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="应用类型" prop="appType">
          <Select v-model="formItem.appType" @on-change="handleOnAppTypeChange">
            <Option value="server">服务器应用</Option>
            <Option value="app">手机应用</Option>
            <Option value="pc">PC网页应用</Option>
            <Option value="wap">手机网页应用</Option>
          </Select>
        </FormItem>
        <FormItem v-if="formItem.appType === 'app'" prop="appOs" label="操作系统">
          <RadioGroup v-model="formItem.appOs">
            <Radio label="ios">
              <Icon type="logo-apple"></Icon>
              <span>苹果IOS</span>
            </Radio>
            <Radio label="android">
              <Icon type="logo-android"></Icon>
              <span>安卓Android</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="应用官网" prop="website">
          <Input v-model="formItem.website" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model="formItem.status">
            <Radio label="0">下线</Radio>
            <Radio label="1">上线</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.appDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <Form ref="form2" v-show="current=='form2'" :model="formItem" :rules="formItemRules" :label-width="135">
        <FormItem label="授权类型" prop="grantTypes">
          <CheckboxGroup v-model="formItem.grantTypes">
            <Tooltip :content="item.desc" v-for="item in selectGrantTypes">
              <Checkbox :label="item.label"><span>{{ item.title }}</span></Checkbox>
            </Tooltip>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="用户授权范围" prop="scopes">
            <span slot="label">用户授权范围
            <Tooltip content="提醒用户确认授权可访问的资源">
              <Icon type="ios-alert" size="16"/>
            </Tooltip>
            </span>
          <CheckboxGroup v-model="formItem.scopes">
            <Checkbox v-for="item in selectScopes" :label="item.label"><span>{{ item.title }}</span>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="自动授权范围">
            <span slot="label">自动授权范围
              <Tooltip content="不再提醒用户确认授权可访问的资源">
              <Icon type="ios-alert" size="16"/>
            </Tooltip>
            </span>
          <CheckboxGroup v-model="formItem.autoApproveScopes">
            <Checkbox v-for="item in selectScopes" :label="item.label"><span>{{ item.title }}</span>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="令牌有效期" prop="accessTokenValidity">
          <RadioGroup v-model="formItem.tokenValidity">
            <Radio label="1">设置有效期</Radio>
            <Radio label="0">不限制</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem v-show="formItem.tokenValidity === '1'" label="访问令牌有效期" prop="accessTokenValidity">
          <InputNumber :min="900" v-model="formItem.accessTokenValidity"></InputNumber>
          <span>&nbsp;&nbsp;秒</span>
        </FormItem>
        <FormItem v-show="formItem.tokenValidity === '1'" label="刷新令牌有效期" prop="refreshTokenValidity">
          <InputNumber :min="900" v-model="formItem.refreshTokenValidity"></InputNumber>
          <span>&nbsp;&nbsp;秒</span>
        </FormItem>
        <FormItem label="第三方登陆回掉地址" prop="redirectUrls">
          <Input v-model="formItem.redirectUrls" type="textarea" placeholder="请输入内容"></Input>
          <span>多个地址使用,逗号隔开</span>
        </FormItem>
      </Form>
      <Form ref="form3" v-show="current=='form3'" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="过期时间(选填)" prop="expireTime">
          <Badge v-if="formItem.isExpired" count="授权已过期">
            <DatePicker v-model="formItem.expireTime" class="ivu-form-item-error" type="datetime"
                        placeholder="设置有效期"></DatePicker>
          </Badge>
          <DatePicker v-else="" v-model="formItem.expireTime" type="datetime" placeholder="设置有效期"></DatePicker>
        </FormItem>
        <FormItem label="开放接口(选填)" prop="authorities">
          <Alert type="warning" show-icon>请注意：由于客户端模式可以直接调用接口，为保证接口安全只能选择开放接口资源&nbsp;&nbsp;<a @click="handleGoApi()">开放更多接口</a></Alert>
          <Transfer
            :data="selectApis"
            :list-style="{width: '300px',height: '450px'}"
            :titles="['选择接口', '已选择接口']"
            :render-format="transferRender"
            :target-keys="formItem.authorities"
            @on-change="handleTransferChange"
            filterable>
          </Transfer>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="saving" @click="handleSubmit">保存</Button>&nbsp;
        <Button type="default" @click="handleReset">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getApps, updateApp, addApp, removeApp, getAppClientInfo, updateAppClientInfo, restApp} from '@/api/app'
  import {getAllUsers} from '@/api/user'
  import {startWith, listConvertGroup} from '@/libs/util'
  import {
    getAuthorityApi,
    getAuthorityApp,
    grantAuthorityApp
  } from '@/api/authority'

  export default {
    name: 'SystemApp',
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('英文不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线'))
        } else {
          callback()
        }
      }
      return {
        loading: false,
        saving: false,
        current: 'form1',
        forms: [
          'form1',
          'form2',
          'form3'
        ],
        selectApis: [],
        selectUsers: [],
        selectGrantTypes: [
          {label: 'authorization_code', title: '授权码模式', desc: 'Web服务端应用与第三方移动App应用'},
          {label: 'client_credentials', title: '客户端模式', desc: '没有用户参与的,内部服务端与第三方服务端'},
          {label: 'password', title: '密码模式', desc: '内部Web网页应用与内部移动App应用'},
          {label: 'implicit', title: '简化模式', desc: 'Web网页应用或第三方移动App应用'},
          {label: 'refresh_token', title: '刷新令牌', desc: '刷新并延迟访问令牌时长'},
        ],
        selectScopes: [
          {label: 'userProfile', title: '允许访问基本信息'},
          // 这是测试数据,自定义对应接口权限标识
          {label: 'api1', title: '允许访问....自定义信息'},
        ],
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10,
          appId: '',
          appName: '',
          appNameEn: ''
        },
        defaultList: [
          {
            'name': 'bc7521e033abdd1e92222d733590f104',
            'url': 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar'
          }
        ],
        modalVisible: false,
        modalTitle: '',
        imgName: '',
        visible: false,
        uploadList: [],
        formItemRules: {
          userId: [
            {required: true, message: '开发者不能为空', trigger: 'blur'}
          ],
          userType: [
            {required: true, message: '开发者类型不能为空', trigger: 'blur'}
          ],
          website: [
            {required: true, message: '官网不能为空', trigger: 'blur'},
            {type: 'url', message: '请输入有效网址', trigger: 'blur'}
          ],
          appType: [
            {required: true, message: '应用类型不能为空', trigger: 'blur'}
          ],
          appOs: [
            {required: true, message: '操作系统不能为空', trigger: 'blur'}
          ],
          redirectUrls: [
            {required: true, message: '授权重定向地址不能为空', trigger: 'blur'}
          ],
          appName: [
            {required: true, message: '应用名称不能为空', trigger: 'blur'}
          ],
          appNameEn: [
            {required: true, validator: validateEn, trigger: 'blur'}
          ],
          grantTypes: [
            {required: true, type: 'array', min: 1, message: '授权类型不能为空', trigger: 'blur'}
          ],
          scopes: [
            {required: true, type: 'array', min: 1, message: '用户授权范围不能为空', trigger: 'blur'}
          ],
          accessTokenValidity: [
            {required: true, type: 'integer', min: 900, message: '访问令牌有效期不能少于900', trigger: 'blur'}
          ],
          refreshTokenValidity: [
            {required: true, type: 'integer', min: 900, message: '刷新令牌有效期不能少于900', trigger: 'blur'}
          ],
        },
        formItem: {
          appId: '',
          appSecret: '',
          appName: '',
          appNameEn: '',
          appType: 'server',
          appIcon: 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar',
          appOs: '',
          path: '',
          website: '',
          appDesc: '',
          status: 1,
          redirectUrls: '',
          userId: '',
          userType: 'platform',
          scopes: ['userProfile'],
          autoApproveScopes: [],
          authorities: [],
          grantTypes: ['authorization_code', 'client_credentials'],
          accessTokenValidity: 43200,
          refreshTokenValidity: 2592000,
          expireTime: '',
          isExpired: false,
          tokenValidity: '1'
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: 'AppId',
            key: 'appId',
            width: 200
          },
          {
            title: '应用名称',
            key: 'appName',
            width: 200
          },
          {
            title: '英文名称',
            key: 'appNameEn',
            width: 200
          },
          {
            title: '开发者',
            key: 'userName',
            width: 200
          },
          {
            title: '应用类型',
            slot: 'appType',
            width: 180,
            filters: [
              {
                label: '服务器应用',
                value: 0
              },
              {
                label: '手机应用',
                value: 1
              },
              {
                label: 'PC网页应用',
                value: 2
              },
              {
                label: '手机网页应用',
                value: 3
              }
            ],
            filterMultiple: false,
            filterMethod (value, row) {
              if (value === 0) {
                return row.appType === 'server'
              } else if (value === 1) {
                return row.appType === 'app'
              } else if (value === 2) {
                return row.appType === 'pc'
              } else if (value === 3) {
                return row.appType === 'wap'
              }
            }
          },
          {
            title: '开发者类型',
            key: 'userType',
            slot: 'userType',
            width: 180
          },
          {
            title: '状态',
            slot: 'status',
            sortable: true,
            key: 'status',
            width: 100,
            filters: [
              {
                label: '下线',
                value: 0
              },
              {
                label: '上线',
                value: 1
              }
            ],
            filterMultiple: false,
            filterMethod (value, row) {
              if (value === 0) {
                return row.status === 0
              } else if (value === 1) {
                return row.status === 1
              }
            }
          },
          {
            title: '描述',
            key: 'appDesc',
            width: 200
          },
          {
            title: '最后修改时间',
            sortable: true,
            key: 'updateTime',
            width: 180
          },
          {
            title: '操作',
            slot: 'action',
            fixed: 'right',
            width: 120
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data, step) {
        if (data) {
          this.formItem = Object.assign({}, this.formItem, data)
        }
        if (!step) {
          step = this.forms[0]
        }
        if (step === this.forms[0]) {
          this.modalTitle = data ? '编辑应用 - ' + data.appName : '添加应用'
          this.handleLoadUsers()
        }
        if (step === this.forms[1]) {
          this.modalTitle = data ? '应用开发配置 - ' + data.appName : '应用开发配置'
          this.handleLoadAppClientInfo(this.formItem.appId)
        }
        if (step === this.forms[2]) {
          this.modalTitle = data ? '应用功能授权 - ' + data.appName : '应用功能授权'
          this.handleLoadAppGranted(this.formItem.appId)
        }
        this.formItem.status = this.formItem.status + ''
        this.current = step
      },
      handleResetForm (form) {
        this.$refs[form].resetFields()
      },
      handleReset () {
        //重置验证
        const newData = {
          appId: '',
          appSecret: '',
          appName: '',
          appNameEn: '',
          appType: 'server',
          appIcon: 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar',
          appOs: '',
          website: '',
          appDesc: '',
          status: 1,
          userId: '',
          userType: 'platform',
          scopes: ['userProfile'],
          autoApproveScopes: [],
          authorities: [],
          grantTypes: ['authorization_code', 'client_credentials'],
          accessTokenValidity: 43200,
          refreshTokenValidity: 2592000,
          expireTime: '',
          isExpired: false,
          tokenValidity: '1'
        }
        this.formItem = newData
        this.forms.map(form => {
          this.handleResetForm(form)
        })
        this.current = this.forms[0]
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        if (this.current === this.forms[0]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              const data = Object.assign({}, this.formItem)
              if (data.appId) {
                updateApp(data).then(res => {
                  if (res.code === 100) {
                    this.$Message.success('保存成功')
                  }
                  this.handleReset()
                  this.handleSearch()
                }).finally(() => {
                  this.saving = false
                })
              } else {
                addApp(data).then(res => {
                  if (res.code === 100) {
                    this.$Message.success('保存成功')
                  }
                  this.handleReset()
                  this.handleSearch()
                }).finally(() => {
                  this.saving = false
                })
              }
            }
          })
        }

        if (this.current === this.forms[1]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.tokenValidity === '0') {
                this.formItem.accessTokenValidity = -1
                this.formItem.refreshTokenValidity = -1
              }
              updateAppClientInfo(this.formItem).then(res => {
                if (res.code === 100) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              }).finally(() => {
                this.saving = false
              })
            }
          })
        }

        if (this.current === this.forms[2]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              grantAuthorityApp({
                appId: this.formItem.appId,
                expireTime: this.formItem.expireTime ? this.formItem.expireTime.pattern('yyyy-MM-dd HH:mm:ss') : '',
                authorityIds: this.formItem.authorities
              }).then(res => {
                if (res.code === 100) {
                  this.$Message.success('授权成功')
                  this.handleReset()
                }
                this.handleSearch()
              }).finally(() => {
                this.saving = false
              })
            }
          })
        }
      },
      handleSearch(page) {
        if (page) {
          this.pageInfo.page = page
        }
        this.loading = true
        getApps(this.pageInfo).then(res => {
          this.data = res.data.records
          this.pageInfo.total = parseInt(res.data.total)
        }).finally(() => {
          this.loading = false
        })
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '删除后将无法恢复,确定删除吗？',
          onOk: () => {
            removeApp({appId: data.appId}).then(res => {
              this.handleSearch()
              if (res.code === 100) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
            })
          }
        })
      },
      handleResetSecret (data) {
        this.$Modal.confirm({
          title: '重置后将影响应用正常使用,确定重置吗？',
          onOk: () => {
            restApp({appId: data.appId}).then(res => {
              if (res.code === 100) {
                this.pageInfo.page = 1
                this.formItem.appSecret = res.data
                this.$Message.success('重置成功,请妥善保管.并及时更新到相关应用')
              }
              this.handleSearch()
            })
          }
        })
      },
      handleClick (name, row) {
        switch (name) {
          case 'clientInfo':
            this.handleModal(row, this.forms[1])
            break
          case'grantApi':
            this.handleModal(row, this.forms[2])
            break
          case 'remove':
            this.handleRemove(row)
            break
          case 'resetSecret':
            this.handleResetSecret(row)
            break
        }
      },
      handleOnAppTypeChange (data) {
        if (data !== 'app') {
          this.formItem.appOs = ''
        } else {
          if (!this.formItem.appOs) {
            this.formItem.appOs = 'ios'
          }
        }
      },
      handleOnSelectUser (data) {
        this.formItem.userId = data.userId
        this.formItem.userType = data.userType
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      }
      ,
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleLoadAppGranted (appId) {
        if (!appId) {
          return
        }
        const that = this
        const p1 = getAuthorityApi('',1)
        const p2 = getAuthorityApp(appId)
        Promise.all([p1, p2]).then(function (values) {
          let res1 = values[0]
          let res2 = values[1]
          if (res1.code === 0) {
            res1.data.map(item => {
              item.key = item.authorityId
              item.label = `${item.prefix.replace('/**','')}${item.path} - ${item.apiName}`
              item.disabled = item.path === '/**'
            })
            that.selectApis = res1.data
          }
          if (res2.code === 0) {
            res2.data.map(item => {
              that.formItem.authorities.push(item.authorityId)
            })
            // 时间
            if (res2.data.length > 0) {
              that.formItem.expireTime = res2.data[0].expireTime
              that.formItem.isExpired = res2.data[0].isExpired
            }
          }
          that.modalVisible = true
        })
      },
      handleLoadAppClientInfo (appId) {
        if (!appId) {
          return
        }
        getAppClientInfo({appId: appId}).then(res => {
          if (res.code === 100) {
            this.formItem.scopes = res.data.scope ? res.data.scope : []
            this.formItem.redirectUrls = res.data.redirect_uri ? res.data.redirect_uri.join(',') : ''
            this.formItem.grantTypes = res.data.authorized_grant_types ? res.data.authorized_grant_types : []
            this.formItem.accessTokenValidity = res.data.access_token_validity
            this.formItem.refreshTokenValidity = res.data.refresh_token_validity
            this.formItem.autoApproveScopes = res.data.autoapprove ? res.data.autoapprove : []
            this.formItem.tokenValidity = this.formItem.accessTokenValidity === -1 ? '0' : '1';
          }
          this.modalVisible = true
        })
      },
      transferRender (item) {
        return `<span  title="${item.label}">${item.label}</span>`
      },
      handleTransferChange (newTargetKeys, direction, moveKeys) {
        if (newTargetKeys.indexOf('1') != -1) {
          this.formItem.authorities = ['1']
        } else {
          this.formItem.authorities = newTargetKeys
        }
      },
      handleLoadUsers () {
        getAllUsers().then(res => {
          if (res.code === 100) {
            this.selectUsers = res.data
          }
          this.modalVisible = true
        })
      },
      handleView (name) {
        this.imgName = name
        this.visible = true
      }
      ,
      handleRemoveImg (file) {
        const fileList = this.$refs.upload.fileList
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      }
      ,
      handleSuccess (res, file) {
        file.url = 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar'
        file.name = '7eb99afb9d5f317c912f08b5212fd69a'
      }
      ,
      handleFormatError (file) {
        this.$Message.warning('图片支持png、jpg、jpeg')
      }
      ,
      handleMaxSize (file) {
        this.$Message.warning('图片大小不能超过2M.')
      }
      ,
      handleBeforeUpload () {
        const check = this.uploadList.length < 1
        if (!check) {
          this.$Message.warning('只能上传一张.')
        }
        return check
      },
      handleGoApi(){
        this.$router.push({name:'systemApi'})
      }
    },
    mounted: function () {
      this.handleSearch()
      this.uploadList = this.$refs.upload.fileList
    }
  }
</script>
<style scoped>
  .upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .upload-list img {
    width: 100%;
    height: 100%;
  }

  .upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .upload-list:hover .upload-list-cover {
    display: block;
  }

  .upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
