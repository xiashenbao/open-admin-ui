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
           width="680"
           @on-ok="handleSubmit"
           @on-cancel="handleCancel">
      <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="80">
        <FormItem label="父级菜单" prop="parentId">
          <Select   v-model="formItem.parentId" @on-change="selectTree" >
            <Option value="0">根节点</Option>
            <Tree :data="data"  :render="renderTree"></Tree>
          </Select>
        </FormItem>
        <FormItem label="菜单编码" prop="menuCode">
          <Input v-model="formItem.menuCode" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="菜单名称" prop="menuName">
          <Input v-model="formItem.menuName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="请求地址" prop="path">
          <Input v-model="formItem.path" placeholder="请输入内容">
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
          <Input v-model="formItem.menuDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
    </Modal>


  </div>
</template>

<script>
  import {listConvertTree} from '@/libs/util'
  import {getMenus, updateMenu, addMenu, removeMenu} from '@/api/menu'
  export default {
    name: 'tree_table_page',
    data () {
      return {
        modalVisible: false,
        modalTitle: "",
        loading: true,
        treeData:[
          {
            title: 'parent 1',
            expand: true,
            selected: true,
            value: '1',
            children: [
              {
                title: 'parent 1-1',
                expand: true,
                value: '11',
                children: [
                  {
                    value: '111',
                    title: 'leaf 1-1-1'
                  },
                  {
                    value: '112',
                    title: 'leaf 1-1-2'
                  }
                ]
              },
              {
                title: 'parent 1-2',
                value: '12',
                expand: true,
                children: [
                  {
                    value: '121',
                    title: 'leaf 1-2-1'
                  },
                  {
                    value: '122',
                    title: 'leaf 1-2-2'
                  }
                ]
              }
            ]
          }
        ],
        formItemRules: {
          parentId: [
            {required: true, message: '父级菜单不能为空', trigger: 'blur'}
          ],
          menuCode: [
            {required: true, message: '菜单编码不能为空', trigger: 'blur'}
          ],
          menuName: [
            {required: true, message: '菜单名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: '',
          path: '',
          prefix: '/',
          target: '_self',
          status: 1,
          statusSwatch: true,
          parentId: '0',
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
            title: '父级菜单',
            key: 'parentId',
            minWidth: '100px'
          },
          {
            title: '请求前缀',
            key: 'prefix'
          },
          {
            title: '请求路径',
            key: 'path',
            minWidth: '200px'
          },
          {
            title: '打开方式',
            key: 'target'
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
            minWidth: '200px'
          },
          {
            title: '更新时间',
            key: 'updateTime',
            minWidth: '150px'
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
      // 子节点的option
      renderTree(h, { root, node, data }) {
        return  h('Option', {
          style: {
            display: 'inline-block',
            margin: '0'
          },
          props:{
            key:data.menuId,
            value: data.menuId
          }
        }, data.menuName);
      },
      showModal(data){
        const newData = {
          menuId: '',
          menuCode: '',
          menuName: '',
          icon: '',
          path: '',
          prefix: '/',
          target: '_self',
          status: 1,
          statusSwatch: true,
          parentId: '0',
          priority: 0,
          menuDesc: ''
        }
        if (data) {
          this.modalTitle = '编辑菜单'
          this.formItem = Object.assign({}, newData, data.row);
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false;
        }
        else {
          this.modalTitle = '添加菜单'
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
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0;
            if (this.formItem.menuId) {
              updateMenu(this.formItem).then(res => {
                this.handleCancel()
                this.getMenus()
              })
            } else {
              addMenu(this.formItem).then(res => {
                this.handleCancel()
                this.getMenus()
              })
            }
          }
        })
      },
      handleRemoveMenu(data){
        removeMenu({menuId: data.row.menuId}).then(res => {
          this.getMenus()
        })
      },
      selectTree(data){
        console.log(data)
      },
      getMenus() {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0',
            extraData:{expand:true}
          }
          this.data = listConvertTree(res.data.list, opt)
        })
      }
    }
  }
</script>

<style>

</style>
