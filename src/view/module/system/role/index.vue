<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup size="small">
          <Button  class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新增角色
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
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
      <Steps :current="current" size="small">
        <Step title="角色信息"></Step>
        <Step title="授权菜单和操作"></Step>
        <Step title="授权接口"></Step>
      </Steps>
      <Form  ref="form1" v-show="current===0"  :model="formItem" :rules="formItemRules" :label-width="100">
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
      <Form  ref="form2" v-show="current===1"  :model="formItem"  :rules="formItemRules" :label-width="100">
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
      <Form  ref="form3" v-show="current===2"  :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="接口资源" prop="grantApis" >
          <Select v-model="formItem.grantApis" multiple filterable  @on-change="handleOnSelectApis">
            <OptionGroup  v-for="(item,index) in selectApis" :label="item.apiCategory">
              <Option :title="cate.apiDesc" :disabled="cate.apiCode!=='all' && formItem.grantApis.indexOf('all')!=-1?true:false" v-for="cate in item.children" :value="cate.apiCode" :label="cate.apiName">
                <span>{{ cate.apiName }}</span>
                <span style="float:right;color:#ccc;">{{ cate.path }}</span></Option>
            </OptionGroup>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="current!==0" type="default" @click="handleUp" style="float: left">上一步</Button>&nbsp;
        <Button v-if="current===2" type="primary" @click="handleSubmit">提交</Button>&nbsp;
        <Button type="default" @click="handleReset">取消</Button>
        <Button v-if="current!==2" type="primary" @click="handleNext">下一步</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getRoles, updateRole, addRole, removeRole,getRoleGrantedMenu,getRoleGrantedAction} from '@/api/role'
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
        current: 0,
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
            {required: true, type: 'array', min: 1, message: '接口资源不能为空', trigger: 'blur'}
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
            slot: 'action',
            width: 125,
            fixed:'right'
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
      handleNext () {
        this.$refs[this.forms[this.current]].validate((valid) => {
          if (valid) {
            if (this.current < 2) {
              this.current += 1
            }
          }
        })
      },
      handleUp () {
        if (this.current > 0 && this.current < 3) {
          this.current -= 1
        }
      },
      checkboxClick (row, rowIndex, $event) {
        this.formItem.grantMenus = this.$refs['tree'].getCheckedProp('menuId')
        if(this.formItem.grantMenus && this.formItem.grantMenus.length===0){
          this.formItem.grantActions=[]
        }
      },
      handleModal (data,step) {
        if(!step){
          step =  0
        }
        this.current = step
        if (data) {
          this.modalTitle = '编辑角色'
          this.formItem = Object.assign({},  this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
          this.handleLoadRoleGranted(this.formItem.roleId)
        } else {
          this.modalTitle = '添加角色'
        }
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
        this.current = 0
        this.modalVisible = false
      },
      handleSubmit () {
        this.$refs[this.forms[this.current]].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.roleId) {
              updateRole(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              })
            } else {
              addRole(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              })
            }
          }
        })
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
            console.log(JSON.stringify(res))
           if(res.code ===0){
             let  result = []
              res.data.list.map( item =>{
                result.push(item.resourceId)
              })
             this.formItem.grantMenus = result
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
      },
      handleLoadMenus () {
        getMenuActions().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
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
          case 'remove':
            this.handleRemove(row)
            break
        }
      }
    },
    mounted: function () {
      this.handleSearch()
      this.handleLoadMenus()
      this.handleLoadApis()
    }
  }
</script>
