<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建用户
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="正常"/>
          <Badge v-else-if="row.status===2" status="success" text="锁定"/>
          <Badge v-else="" status="error" text="禁用"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)" :disabled="row.userName === 'admin' ?true:false">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)" :disabled="row.userName === 'admin' ?true:false">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="grantMenu">菜单授权</DropdownItem>
              <DropdownItem name="grantApi">接口授权</DropdownItem>
              <DropdownItem name="remove">修改密码</DropdownItem>
            </DropdownMenu>
          </Dropdown>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-ok="handleSubmit"
           @on-cancel="handleReset">
      <Tabs v-model="current">
        <TabPane label="用户信息" name="form1">.
          <Form ref="form1" :model="formItem" :rules="formItemRules" :label-width="100">
            <FormItem label="用户类型" prop="userType">
              <RadioGroup v-model="formItem.userType">
                <Radio label="platform">平台</Radio>
                <Radio label="isp">服务提供商</Radio>
                <Radio label="dev">自研开发者</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="用户角色" prop="grantRoles">
              <Select v-model="formItem.grantRoles" multiple filterable>
                  <Option :title="role.roleName"
                          v-for="role in selectRoles" :value="role.roleId" :label="role.roleName">
                   </Option>
              </Select>
            </FormItem>
            <FormItem label="昵称" prop="nickName">
              <Input v-model="formItem.nickName" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="登录名" prop="userName">
              <Input :disabled="formItem.userId?true:false" v-model="formItem.userName" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem v-if="formItem.userId?false:true" label="登录密码" prop="password">
              <Input type="password" v-model="formItem.password" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem v-if="formItem.userId?false:true" label="再次确认密码" prop="passwordConfirm">
              <Input type="password" v-model="formItem.passwordConfirm" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="邮箱" prop="email">
              <Input v-model="formItem.email" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="手机号" prop="mobile">
              <Input v-model="formItem.mobile" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="状态">
              <RadioGroup v-model="formItem.status">
                <Radio label="0">禁用</Radio>
                <Radio label="1">正常</Radio>
                <Radio label="2">锁定</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="描述">
              <Input v-model="formItem.userDesc" type="textarea" placeholder="请输入内容"></Input>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="私有菜单授权"  :disabled="formItem.userId?false:true" name="form2">
          <Form ref="form2" :model="formItem" :rules="formItemRules" :label-width="100">
            <FormItem label="菜单/操作资源" prop="grantMenus">
              <tree-table
                ref="tree"
                max-height="400"
                expand-key="menuName"
                @checkbox-click="checkboxClick"
                :expand-type="false"
                :is-fold="false"
                :tree-type="true"
                :selectable="true"
                :columns="columns2"
                :data="selectMenus">
                <template slot="status" slot-scope="scope">
                  <CheckboxGroup v-model="formItem.grantActions">
                    <Checkbox v-for="item in scope.row.actionList" :label="item.actionId">
                      <span>{{item.actionName}}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </template>
              </tree-table>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="私有接口授权"  :disabled="formItem.userId?false:true" name="form3">
          <Form ref="form3" :model="formItem" :rules="formItemRules" :label-width="100">
            <FormItem label="接口资源" prop="grantApis">
              <Select v-model="formItem.grantApis" multiple filterable @on-change="handleOnSelectApis">
                <OptionGroup v-for="(item,index) in selectApis" :label="item.apiCategory">
                  <Option :title="cate.apiDesc"
                          :disabled="cate.apiCode!=='all' && formItem.grantApis.indexOf('all')!=-1?true:false"
                          v-for="cate in item.children" :value="cate.apiId" :label="cate.apiName">
                    <span>{{ cate.apiName }}</span>
                    <span style="float:right;color:#ccc;">{{ cate.path }}</span></Option>
                </OptionGroup>
              </Select>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
      <div slot="footer">
        <Button type="primary" :loading="saving" @click="handleSubmit">保存</Button>&nbsp;
        <Button type="default" @click="handleReset">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getUsers, updateUser, addUser,getUserRoles} from '@/api/user'
  import {
    getGrantedUserMenu,
    getGrantedUserAction,
    getGrantedUserApi,
    grantUserMenu,
    grantUserAction,
    grantUserApi
  } from '@/api/grant-access'
  import {getMenuActions} from '@/api/menu'
  import {getAllApi} from '@/api/apis'
  import {getAllRoles} from '@/api/role'
  import {startWith, listConvertGroup, listConvertTree} from '@/libs/util'

  export default {
    name: 'SystemUser',
    data () {
      const validatePassConfirm = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.formItem.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }
      const validateMobile = (rule, value, callback) => {
        let reg = /^1\d{10}$/
        if (value !== '' && !reg.test(value)) {
          callback(new Error('手机号码格式不正确'))
        } else {
          callback()
        }
      }
      return {
        loading: false,
        saving: false,
        modalVisible: false,
        modalTitle: '',
        current: 'form1',
        forms: [
          'form1',
          'form2',
          'form3'
        ],
        selectApis: [],
        selectMenus: [],
        selectRoles:[],
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        formItemRules: {
          userType: [
            {required: true, message: '用户类型不能为空', trigger: 'blur'}
          ],
          userName: [
            {required: true, message: '登录名不能为空', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '登录密码不能为空', trigger: 'blur'}
          ],
          passwordConfirm: [
            {validator: validatePassConfirm, trigger: 'blur'}
          ],
          nickName: [
            {required: true, message: '昵称不能为空', trigger: 'blur'}
          ],
          email: [
            {required: true, type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ]
          ,
          mobile: [
            {validator: validateMobile, trigger: 'blur'}
          ],
          grantRoles: [
            {required: true, type: 'array', min: 1, message: '用户角色不能为空', trigger: 'blur'}
          ],
          grantMenus: [
            {required: true, type: 'array', min: 1, message: '菜单资源不能为空', trigger: 'blur'}
          ],
          grantApis: [
            {required: true, type: 'array', min: 1, message: '接口资源不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          userId: '',
          userName: '',
          nickName: '',
          password: '',
          passwordConfirm: '',
          status: 1,
          companyId: '',
          email: '',
          mobile: '',
          userType: 'platform',
          userDesc: '',
          avatar: '',
          grantRoles:[],
          grantMenus: [],
          grantActions: [],
          grantApis: []
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '登录名称',
            key: 'userName'
          },
          {
            title: '昵称',
            key: 'nickName'
          },
          {
            title: '邮箱',
            key: 'email'
          },
          {
            title: '手机号',
            key: 'mobile'
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '用户类型',
            key: 'userType'
          },
          {
            title: '描述',
            key: 'userDesc'
          },
          {
            title: '注册时间',
            key: 'registerTime'
          },
          {
            title: '操作',
            slot: 'action'
          }
        ],
        columns2: [
          {
            title: '菜单资源',
            key: 'menuName',
            minWidth: '250px'
          },
          {
            title: '操作资源',
            type: 'template',
            template: 'status',
            minWidth: '200px'
          },
        ],
        data: []
      }
    },
    methods: {
      checkboxClick (row, rowIndex, $event) {
        this.formItem.grantMenus = this.$refs['tree'].getCheckedProp('menuId')
        if (this.formItem.grantMenus && this.formItem.grantMenus.length === 0) {
          this.formItem.grantActions = []
        }
      },
      handleModal (data, step) {
        if (data) {
          this.modalTitle = '编辑用户'
          this.formItem = Object.assign({}, this.formItem, data)
          this.handleLoadUserGranted(this.formItem.userId)
        } else {
          this.modalTitle = '添加用户'
        }
        this.formItem.status = this.formItem.status + ''
        if (!step) {
          step = this.forms[0]
        }
        this.current = step
        this.modalVisible = true
      },
      handleReset () {
        const newData = {
          userId: '',
          userName: '',
          nickName: '',
          password: '',
          passwordConfirm: '',
          status: 1,
          companyId: '',
          email: '',
          mobile: '',
          userType: 'platform',
          userDesc: '',
          avatar: '',
          grantRoles:[],
          grantMenus: [],
          grantActions: [],
          grantApis: []
        }
        this.formItem = newData
        //重置验证
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = this.forms[0]
        this.formItem.grantMenus = []
        this.formItem.grantActions = []
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        if (this.current === this.forms[0]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              this.formItem.roleIds = this.formItem.grantRoles.join(',')
              if (this.formItem.userId) {
                updateUser(this.formItem).then(res => {
                  this.saving = false
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                  }
                })
              } else {
                addUser(this.formItem).then(res => {
                  this.saving = false
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                  }
                })
              }
            }
          })
        }

        if (this.current === this.forms[1]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.userId) {
                grantUserMenu(this.formItem).then(res => {
                  grantUserAction(this.formItem).then(res => {
                    this.saving = false
                    this.handleSearch()
                    if (res.code === 0) {
                      this.$Message.success('授权成功')
                    }
                  })
                })
              }
            }
          })
        }

        if (this.current === this.forms[2]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.userId) {
                grantUserApi(this.formItem).then(res => {
                  this.saving = false
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('授权成功')
                  }
                })
              }
            }
          })
        }
      },
      handleSearch () {
        this.loading = true
        getUsers({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
          this.loading = false
        })
      },
      handleLoadUserGranted (userId) {
        getGrantedUserMenu(userId).then(res => {
          if (res.code === 0) {
            let result = []
            res.data.list.map(item => {
              result.push(item.resourceId)
            })
            this.formItem.grantMenus = result
            this.handleLoadMenus()
          }
        })
        getGrantedUserAction(userId).then(res => {
          if (res.code === 0) {
            let result = []
            res.data.list.map(item => {
              result.push(item.resourceId)
            })
            this.formItem.grantActions = result
          }
        })
        getGrantedUserApi(userId).then(res => {
          if (res.code === 0) {
            let result = []
            res.data.list.map(item => {
              result.push(item.resourceId)
            })
            this.formItem.grantApis = result
          }
        })
        getUserRoles(userId).then(res => {
          if (res.code === 0) {
            let result = []
            res.data.list.map(item => {
              result.push(item.roleId)
            })
            this.formItem.grantRoles = result
          }
        })
      },
      handleLoadApis () {
        getAllApi().then(res => {
          if (res.code === 0) {
            this.selectApis = listConvertGroup(res.data.list, 'apiCategory')
          }
        })
      },
      handleLoadRoles () {
        getAllRoles().then(res => {
          if (res.code === 0) {
            this.selectRoles = res.data.list
          }
        })
      },
      handleLoadMenus () {
        getMenuActions().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
          if (this.formItem.grantMenus && res.data.list) {
            res.data.list.map(item => {
              if (this.formItem.grantMenus.indexOf(item.menuId) !== -1) {
                item._isChecked = true
              }
            })
          }
          this.selectMenus = listConvertTree(res.data.list, opt)
        })
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      },
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleOnSelectApis (data) {
        // 全部,其他的不用选了
        if (data.indexOf('all') !== -1) {
          this.formItem.grantApis = ['all']
        }
      },
      handleClick (name, row) {
        switch (name) {
          case'grantMenu':
            this.handleModal(row, this.forms[1])
            break
          case'grantApi':
            this.handleModal(row, this.forms[2])
            break
          case 'remove':
            this.handleRemove(row)
            break
        }
      }
    },
    mounted: function () {
      this.handleSearch()
      this.handleLoadApis()
      this.handleLoadRoles()
    }
  }
</script>
