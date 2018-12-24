<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <Button class="search-btn" type="primary" @click="showModal()">
          <Icon type="search"/>&nbsp;&nbsp;添加
        </Button>
      </div>
      <tree-table expand-key="menuName" :expand-type="false" :is-fold="false" :selectable="false" :columns="columns"
                  :data="data">
        <template slot="action" slot-scope="scope">
          <a @click="showModal(scope)">编辑</a> &nbsp;&nbsp;
          <Poptip
            confirm
            title="确定删除吗"
            @on-ok="handleRemoveMenu(scope)">
            <a>删除</a>
          </Poptip>
        </template>
        <template slot="status" slot-scope="scope">
          <Tag v-if="scope.row.status===1" color="blue">有效</Tag>
          <Tag v-else="" color="default">无效</Tag>
        </template>
      </tree-table>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="780"
           @on-ok="handleSubmit"
           @on-cancel="handleCancel">
      <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="80">
        <FormItem label="上级" prop="menuCode">
          <Input v-model="formItem.parentId" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="编码" prop="menuCode">
          <Input v-model="formItem.menuCode" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="名称" prop="menuName">
          <Input v-model="formItem.menuName" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="请求地址" prop="path">
          <Input v-model="formItem.path" placeholder="Enter something...">
            <Select v-model="formItem.prefix" slot="prepend" style="width: 80px">
              <Option value="/">/</Option>
              <Option value="http://">http://</Option>
              <Option value="https://">https://</Option>
            </Select>
            <Select v-model="formItem.target" slot="append" style="width: 100px">
              <Option value="_self">窗口内打开</Option>
              <Option value="_blank">新窗口打开</Option>
            </Select>
          </Input>
        </FormItem>
        <FormItem label="优先级">
          <InputNumber v-model="formItem.priority"></InputNumber>
        </FormItem>
        <FormItem label="状态">
          <i-switch v-model="formItem.statusSwatch" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.menuDesc" type="textarea" placeholder="Enter something..."></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import {listConvertTree} from '@/libs/util'
  import {getMenus,updateMenu,addMenu,removeMenu} from '@/api/menu'
  export default {
    name: 'tree_table_page',
    data () {
      return {
        modalVisible: false,
        modalTitle: "",
        loading:true,
        formItemRules: {
          menuCode: [
            {required: true, message: 'The name cannot be empty', trigger: 'blur'}
          ],
          menuName: [
            {required: true, message: 'Mailbox cannot be empty', trigger: 'blur'}
          ]
        },
        formItem: {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: '',
          path: '',
          prefix:'/',
          target:'_self',
          status: 1,
          statusSwatch:true,
          parentId: '0',
          priority: 0,
          menuDesc: ''
        },
        columns: [
          {
            title: '名称',
            key: 'menuName',
            minWidth: '200px'
          },
          {
            title: '编码',
            key: 'menuCode',
            minWidth: '100px'
          },
          {
            title: '上一级',
            key: 'parentId',
            minWidth: '100px'
          },
          {
            title: '请求前缀',
            key: 'prefix',
            minWidth: '100px'
          },
          {
            title: '请求路径',
            key: 'path',
            minWidth: '200px'
          },
          {
            title: '打开方式',
            key: 'target',
            minWidth: '100px'
          },
          {
            title: '状态',
            key: 'status',
            type: 'template',
            template: 'status'
          },
          {
            title: '描述',
            key: 'menuDesc',
            minWidth: '100px'
          },
          {
            title: '创建时间',
            key: 'createTime',
            minWidth: '100px'
          },
          {
            title: '操作',
            key: '',
            minWidth: '100px',
            type: 'template',
            template: 'action'
          }
        ],
        data: []
      }
    },
    created: function () {
      this.getMenus();
    },
    methods: {
      showModal(data){
        const  newData = {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: '',
          path: '',
          prefix:'/',
          target:'_self',
          status: 1,
          statusSwatch:true,
          parentId: '0',
          priority: 0,
          menuDesc: ''
        }
        if (data) {
          this.modalTitle = '编辑资源'
          this.formItem = Object.assign({},newData,data.row);
          this.formItem.statusSwatch = this.formItem.status===1?true:false;
        }
        else {
          this.modalTitle = '添加资源'
          this.formItem = newData;
        }
        this.modalVisible = true
      },
      handleCancel(){
        //重置验证
        this.$refs['menuForm'].resetFields();
      },
      handleSubmit(){
        this.$refs['menuForm'].validate((valid) => {
          if (valid) {
              this.formItem.status = this.formItem.statusSwatch?1:0;
              if(this.formItem.menuId){
                updateMenu(this.formItem).then(res =>{
                  this.handleCancel()
                  this.getMenus()
                })
              }else{
                addMenu(this.formItem).then(res =>{
                  this.handleCancel()
                  this.getMenus()
                })
              }
          }
        })
      },
      handleRemoveMenu(data){
          removeMenu({menuId:data.row.menuId}).then(res =>{
            this.getMenus()
          })
      },
      getMenus() {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid:'0'
          }
          this.data = listConvertTree(res.data.list, opt)
        })
      }
    }
  }
</script>

<style>

</style>
