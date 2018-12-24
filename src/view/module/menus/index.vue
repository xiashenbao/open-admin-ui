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
          <a @click="handleRemoveMenu(scope)">删除</a>
        </template>
        <template slot="status" slot-scope="scope">
          <Tag v-if="scope.row.status===1" color="blue">有效</Tag>
          <Tag v-else="" color="default">无效</Tag>
        </template>
      </tree-table>
    </Card>
    <template>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="780"
           @on-ok="handleSubmit"
           @on-cancel="handleCancel">
      <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="80">
        <FormItem label="菜单编码" prop="menuCode">
          <Input v-model="formItem.menuCode" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="菜单名称" prop="menuName">
          <Input v-model="formItem.menuName" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="请求地址" prop="url">
          <Input v-model="formItem.url" placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="优先级">
          <InputNumber v-model="formItem.priority"></InputNumber>
        </FormItem>
        <FormItem label="状态">
          <i-switch v-model="formItem.status === 1" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.menuDesc" type="textarea" placeholder="Enter something..."></Input>
        </FormItem>
      </Form>
    </Modal>
    </template>
  </div>
</template>

<script>
  import {listConvertTree} from '@/libs/util'
  import {getMenus,updateMenu,addMenu,removeMenu} from '@/api/menu'
  import '_c/common/common.less';
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
          url: '',
          status: 1,
          parentId: '',
          priority: 0,
          menuDesc: ''
        },
        columns: [
          {
            title: '菜单名称',
            key: 'menuName',
            minWidth: '200px'
          },
          {
            title: '菜单编码',
            key: 'menuCode',
            minWidth: '100px'
          },
          {
            title: '上级菜单',
            key: 'parentId',
            minWidth: '100px'
          },
          {
            title: '地址',
            key: 'url',
            minWidth: '200px'
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
        if (data) {
          this.modalTitle = '编辑'
          this.formItem = data.row;
        }
        else {
          this.modalTitle = '添加'
          this.formItem = {
            menuId: '',
            menuCode: '',
            menuName: '',
            icon: '',
            url: '',
            status: 1,
            parentId: '',
            priority: 0,
            menuDesc: ''
          };
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
              if(this.formItem.menuId){
                updateMenu(this.formItem).then(res =>{
                  if(res && res.code ===0){
                    this.handleCancel()
                    this.getMenus()
                  }
                })
              }else{
                addMenu(this.formItem).then(res =>{
                  if(res && res.code ===0){
                    this.handleCancel()
                    this.getMenus()
                  }
                })
              }
          }
        })
      },
      handleRemoveMenu(data){
          removeMenu({menuId:data.row.menuId}).then(res =>{
            if(res && res.code ===0){
              this.getMenus()
            }
          })
      },
      getMenus() {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId'
          }
          this.data = listConvertTree(res.data.list, opt)
        })
      }
    }
  }
</script>

<style>

</style>
