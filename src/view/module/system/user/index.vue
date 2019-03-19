<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup >
          <Button v-show="hasAuthority('operation:systemUserCreate')" class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;添加用户
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
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="grantRole">分配角色</DropdownItem>
              <DropdownItem name="grantMenu">分配特殊权限</DropdownItem>
            </DropdownMenu>
          </Dropdown>&nbsp;
        </template>
      </Table>
      <Page transfer :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-cancel="handleReset">
      <Form v-show="current == 'form1'" ref="form1" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="用户类型" prop="userType">
          <RadioGroup v-model="formItem.userType">
            <Radio label="platform">系统用户</Radio>
            <Radio label="isp">服务提供商</Radio>
            <Radio label="dev">自研开发者</Radio>
          </RadioGroup>
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
      <Form v-show="current == 'form2'" ref="form2" :model="formItem" :label-width="100" :rules="formItemRules">
        <FormItem label="分配角色" prop="grantRoles">
          <CheckboxGroup v-model="formItem.grantRoles">
            <Checkbox v-for="item in selectRoles" :label="item.roleId"><span>{{ item.roleName }}</span></Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
      <Form v-show="current == 'form3'" ref="form3" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="过期时间(选填)" prop="expireTime">
          <Badge v-if="formItem.isExpired" count="授权已过期">
            <DatePicker v-model="formItem.expireTime" class="ivu-form-item-error" type="datetime" placeholder="设置有效期"></DatePicker>
          </Badge>
          <DatePicker v-else="" v-model="formItem.expireTime" type="datetime" placeholder="设置有效期"></DatePicker>
        </FormItem>
        <FormItem label="分配权限(选填)" prop="grantMenus">
          <tree-table
            ref="tree"
            style="max-height:500px;overflow: auto"
            expand-key="menuName"
            :expand-type="false"
            :is-fold="false"
            :tree-type="true"
            :selectable="true"
            :columns="columns2"
            :data="selectMenus">
            <template slot="operation" slot-scope="scope">
              <CheckboxGroup v-model="formItem.grantOperations">
                <Checkbox v-for="item in scope.row.operationList" :label="item.authorityId">
                  <span  :title="item.operationDesc">{{item.operationName}}</span>
                </Checkbox>
              </CheckboxGroup>
            </template>
          </tree-table>
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
  import {getUsers, updateUser, addUser, getUserRoles, addUserRoles} from '@/api/user'
  import {getAllRoles} from '@/api/role'
  import {startWith, listConvertTree} from '@/libs/util'
  import {
    getMenuAuthorityList,
    getUserGrantedAuthority,
    grantUserAuthority
  } from '@/api/authority'

  export default {
    name: 'SystemUser',
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('登录名不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线'))
        } else {
          callback()
        }
      }
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
        selectMenus: [],
        selectRoles: [],
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
            {required: true,  message: '用户名不能为空', trigger: 'blur'},
            {required: true, validator: validateEn, trigger: 'blur'}
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
            {required: false, type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ]
          ,
          mobile: [
            {validator: validateMobile, trigger: 'blur'}
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
          grantRoles: [],
          grantOperations: [],
          grantMenus: [],
          expireTime: '',
          isExpired:false
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '登录名称',
            key: 'userName',
            width: 200
          },
          {
            title: '昵称',
            key: 'nickName',
            width: 150
          },
          {
            title: '邮箱',
            key: 'email',
            width: 150
          },
          {
            title: '手机号',
            key: 'mobile',
            width: 150
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status',
            width: 100
          },
          {
            title: '用户类型',
            key: 'userType',
            width: 150
          },
          {
            title: '注册时间',
            key: 'registerTime',
            width: 180
          },
          {
            title: '描述',
            key: 'userDesc',
            width:400
          },
          {
            title: '操作',
            slot: 'action',
            fixed:'right',
            width: 120
          }
        ],
        columns2: [
          {
            title: '菜单',
            key: 'menuName',
            minWidth: '250px',
          },
          {
            title: '功能',
            type: 'template',
            template: 'operation',
            minWidth: '200px'
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
          this.modalTitle = data ? '编辑用户 - ' + data.userName : '添加用户'
          this.modalVisible = true
        }
        if (step === this.forms[1]) {
          this.modalTitle = data ? '分配角色 - ' + data.userName : '分配角色'
          this.handleLoadRoles(this.formItem.userId)
        }
        if (step === this.forms[2]) {
          this.modalTitle = data ? '分配特殊权限 - ' + data.userName : '分配特殊权限'
          this.handleLoadUserGranted(this.formItem.userId)
        }
        this.formItem.status=this.formItem.status+''
        this.current = step
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
          grantRoles: [],
          grantMenus: [],
          grantOperations: [],
          expireTime: '',
          isExpired:false
        }
        this.formItem = newData
        //重置验证
        this.forms.map(form => {
          this.$refs[this.current].resetFields()
        })
        this.current = this.forms[0]
        this.formItem.grantMenus = []
        this.formItem.grantOperations = []
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        if (this.current === this.forms[0]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.userId) {
                updateUser(this.formItem).then(res => {
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                    this.handleReset()
                  }
                  this.handleSearch()
                }).finally(() => {
                  this.saving = false
                })
              } else {
                addUser(this.formItem).then(res => {
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                    this.handleReset()
                  }
                  this.handleSearch()
                }).finally(() => {
                  this.saving = false
                })
              }
            }
          })
        }

        if (this.current === this.forms[1] && this.formItem.userId) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              addUserRoles(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('分配角色成功')
                  this.handleReset()
                }
                this.handleSearch()
              }).finally(() => {
                this.saving = false
              })
            }
          })
        }

        if (this.current === this.forms[2] && this.formItem.userId) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              const authorityIds = this.getCheckedAuthorities()
              this.saving = true
              grantUserAuthority({
                userId: this.formItem.userId,
                expireTime: this.formItem.expireTime ? this.formItem.expireTime.pattern("yyyy-MM-dd HH:mm:ss") : '',
                authorityIds: authorityIds
              }).then(res => {
                if (res.code === 0) {
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
      handleSearch () {
        this.loading = true
        getUsers({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
        }).finally(() => {
          this.loading = false
        })
      },
      getCheckedAuthorities() {
        const menus = this.$refs['tree'].getCheckedProp('authorityId')
        return menus.concat(this.formItem.grantOperations)
      },
      handleLoadUserGranted (userId) {
        const that = this
        const p1 = getMenuAuthorityList()
        const p2 = getUserGrantedAuthority(userId)
        Promise.all([p1, p2]).then(function (values) {
          let res1 = values[0]
          let res2 = values[1]
          if (res1.code === 0 && res1.data) {
            let opt = {
              primaryKey: 'menuId',
              parentKey: 'parentId',
              startPid: '0'
            }
            if (res2.code === 0 && res2.data && res2.data.length>0) {
              res2.data.map(item => {
                // 菜单权限
                if (item.authority.indexOf("menu:") != -1) {
                  that.formItem.grantMenus.push(item.authorityId)
                }
                // 操作权限
                if (item.authority.indexOf("operation:") != -1) {
                  that.formItem.grantOperations.push(item.authorityId)
                }
              })
              // 时间
              if(res2.data.length>0){
                that.formItem.expireTime = res2.data[0].expireTime
                that.formItem.isExpired = res2.data[0].isExpired
              }
            }
            res1.data.map(item => {
              // 菜单选中
              if (that.formItem.grantMenus.includes(item.authorityId)) {
                item._isChecked = true
              }
            })
            that.selectMenus = listConvertTree(res1.data, opt)
          }
          that.modalVisible = true
        })
      },
      handleLoadRoles (userId) {
         if(!userId){return}
        const that = this
        const p1 = getAllRoles()
        const p2 = getUserRoles(userId)
        Promise.all([p1, p2]).then(function (values) {
          let res1 = values[0]
          let res2 = values[1]
          if (res1.code === 0) {
            that.selectRoles = res1.data
          }
          if (res2.code === 0) {
            let result = []
            res2.data.map(item => {
              result.push(item.roleId)
            })
            that.formItem.grantRoles = result
          }
          that.modalVisible = true
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
      handleClick (name, row) {
        switch (name) {
          case'grantRole':
            this.handleModal(row, this.forms[1])
            break
          case'grantMenu':
            this.handleModal(row, this.forms[2])
            break
        }
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
