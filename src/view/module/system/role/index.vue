<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button  class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建角色
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)" :disabled="row.roleCode === 'all' ?true:false">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)"  :disabled="row.roleCode === 'all' ?true:false">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu  slot="list">
              <DropdownItem name="grantMenu">菜单授权</DropdownItem>
              <DropdownItem name="grantApi">接口授权</DropdownItem>
              <DropdownItem name="remove">删除角色</DropdownItem>
            </DropdownMenu>
          </Dropdown>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-cancel="handleReset">
      <Tabs v-model="current">
        <TabPane label="角色信息" name="form1">
          <Form  ref="form1"  :model="formItem" :rules="formItemRules" :label-width="100">
            <FormItem label="角色标识" prop="roleCode">
              <Input  v-model="formItem.roleCode" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="角色名称" prop="roleName">
              <Input  v-model="formItem.roleName" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="状态">
              <i-switch v-model="formItem.statusSwatch" size="large">
                <span slot="open">有效</span>
                <span slot="close">无效</span>
              </i-switch>
            </FormItem>
            <FormItem label="描述">
              <Input v-model="formItem.roleDesc" type="textarea" placeholder="请输入内容"></Input>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="菜单授权" :disabled="formItem.roleId?false:true" name="form2">
          <Form  ref="form2"   :model="formItem"  :rules="formItemRules" :label-width="100">
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
        <TabPane label="接口授权" :disabled="formItem.roleId?false:true"  name="form3">
          <Form  ref="form3"   :model="formItem" :rules="formItemRules" :label-width="100">
            <FormItem label="接口资源" prop="grantApis" >
              <Select v-model="formItem.grantApis" multiple filterable  @on-change="handleOnSelectApis">
                <OptionGroup  v-for="(item,index) in selectApis" :label="item.apiCategory">
                  <Option :title="cate.apiDesc" :disabled="cate.apiCode!=='all' && formItem.grantApis.indexOf('all')!=-1?true:false" v-for="cate in item.children" :value="cate.apiId" :label="cate.apiName">
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
  import {getRoles, updateRole, addRole, removeRole,getRoleGrantedMenu,getRoleGrantedAction,getRoleGrantedApi,roleGrantMenu,roleGrantAction,roleGrantApi} from '@/api/role'
  import {getMenuActions} from '@/api/menu'
  import {getAllApi} from '@/api/apis'
  import {startWith,listConvertGroup,listConvertTree} from '@/libs/util'

  export default {
    name: 'SystemRole',
    data () {
      return {
        loading :false,
        modalVisible: false,
        modalTitle: '',
        saving:false,
        current: 'form1',
        forms: [
          'form1',
          'form2',
          'form3'
        ],
        selectApis: [],
        selectMenus:[],
        pageInfo:{
          total:0,
          page:1,
          limit:10
        },
        formItemRules: {
          roleCode: [
            {required: true, message: '角色标识不能为空', trigger: 'blur'}
          ],
          roleName: [
            {required: true, message: '角色名称不能为空', trigger: 'blur'}
          ],
          grantMenus: [
            {required: true, type: 'array', min: 1, message: '菜单资源不能为空', trigger: 'blur'}
          ],
          grantApis: [
            {required: true, type: 'array', min: 1,  message: '接口资源不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          roleId: '',
          roleCode: '',
          roleName: '',
          path: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          roleDesc: '',
          grantMenus:[],
          grantActions:[],
          grantApis:[]
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '角色名称',
            key: 'roleName'
          },
          {
            title: '角色标识',
            key: 'roleCode'
          },
          {
            title: '描述',
            key: 'roleDesc'
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '创建时间',
            key: 'createTime'
          },
          {
            title: '角色',
            slot: 'action'
          }
        ],
        columns2: [
          {
            title: '菜单资源',
            key: 'menuName',
            minWidth: '100px'
          },
          {
            title: '操作资源',
            type: 'template',
            template: 'status',
            minWidth: '300px'
          },
        ],
        data: []
      }
    },
    methods: {
      checkboxClick (row, rowIndex, $event) {
        this.formItem.grantMenus = this.$refs['tree'].getCheckedProp('menuId')
        if(this.formItem.grantMenus && this.formItem.grantMenus.length===0){
          this.formItem.grantActions=[]
        }
      },
      handleModal (data,step) {
        if (data) {
          this.modalTitle = '编辑角色'
          this.formItem = Object.assign({},  this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
          this.handleLoadRoleGranted(this.formItem.roleId)
        } else {
          this.modalTitle = '添加角色'
        }
        if(!step){
          step =  this.forms[0]
        }
        this.current = step
        this.modalVisible = true
      },
      handleReset () {
        const newData = {
          roleId: '',
          roleCode: '',
          roleName: '',
          path: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          roleDesc: '',
          grantMenus:[],
          grantActions:[],
          grantApis:[]
        }
        this.formItem = newData
        //重置验证
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = this.forms[0]
        this.modalVisible = false
        this.formItem.grantMenus = []
        this.formItem.grantActions = []
      },
      handleSubmit () {
        if(this.current === this.forms[0]){
          console.log(this.current)
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              this.formItem.status = this.formItem.statusSwatch ? 1 : 0
              if (this.formItem.roleId) {
                updateRole(this.formItem).then(res => {
                  this.saving = false
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                  }
                })
              } else {
                addRole(this.formItem).then(res => {
                  this.saving = false
                  this.handleReset()
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                  }
                })
              }
            }
          })
        }

        if(this.current === this.forms[1]){
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.roleId) {
                roleGrantMenu(this.formItem).then(res =>{
                  roleGrantAction(this.formItem).then(res=>{
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

        if(this.current === this.forms[2]){
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.roleId) {
                roleGrantApi(this.formItem).then(res=>{
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
        getRoles({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
          this.loading = false
        })
      },
      handlePage(current){
        this.pageInfo.page = current;
        this.handleSearch()
      },
      handlePageSize(size){
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '确定删除吗？',
          onOk: () => {
            removeRole({roleId: data.roleId}).then(res => {
              this.handleSearch()
              if (res.code === 0) {
                this.pageInfo.page=1
                this.$Message.success('删除成功')
              }
            })
          }
        });
      },
      handleLoadApis () {
        getAllApi().then(res => {
          if (res.code === 0) {
            this.selectApis = listConvertGroup(res.data.list, "apiCategory")
          }
        })
      },
      handleLoadRoleGranted(roleId){
        getRoleGrantedMenu(roleId).then(res => {
           if(res.code ===0){
             let  result = []
              res.data.list.map( item =>{
                result.push(item.resourceId)
              })
             this.formItem.grantMenus = result
             this.handleLoadMenus()
           }
        })
        getRoleGrantedAction(roleId).then(res => {
          if(res.code ===0){
            let  result = []
            res.data.list.map( item =>{
              result.push(item.resourceId)
            })
            this.formItem.grantActions = result
          }
        })
        getRoleGrantedApi(roleId).then(res => {
          if(res.code ===0){
            let  result = []
            res.data.list.map( item =>{
              result.push(item.resourceId)
            })
            this.formItem.grantApis = result
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
          if(this.formItem.grantMenus && res.data.list){
            res.data.list.map(item =>{
                if(this.formItem.grantMenus.indexOf(item.menuId)!==-1){
                  item._isChecked = true
                }
             })
          }
          this.selectMenus = listConvertTree(res.data.list, opt)
        })
      },
      handleOnSelectApis(data){
        // 全部,其他的不用选了
        if(data.indexOf('all') !== -1){
          this.formItem.grantApis = ['all']
        }
      },
      handleClick (name,row) {
        switch (name) {
          case'grantMenu':
            this.handleModal(row,this.forms[1])
            break
          case'grantApi':
            this.handleModal(row,this.forms[2])
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
    }
  }
</script>
