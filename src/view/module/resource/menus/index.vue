<template>
  <div>
    <Card shadow >
      <div class="search-con search-con-top">
        <Button class="search-btn" type="primary" @click="handleEdit()">
          <Icon type="search"/>&nbsp;&nbsp;添加
        </Button>
      </div>
      <Row :gutter="16">
        <Col span="10">
          <tree-table height="900" expand-key="menuName" :expand-type="false" :is-fold="false" :selectable="false" :columns="columns"
                      :data="data">
            <template slot="action" slot-scope="scope">
              <a @click="handleEdit(scope)">编辑</a> &nbsp;&nbsp;
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
        </Col>
        <div style="display: block;position: absolute;top: 0;bottom: 0;left: 42%;border: 1px dashed #eee;"></div>
        <Col span="14">
          <Row>
            <Col span="20">
              <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="80">
                <FormItem label="父级菜单" prop="parentId">
                  <treeselect v-model="formItem.parentId"
                              :options="selectTreeData"
                              :default-expand-level="1"
                              :normalizer="treeSelectNormalizer"/>
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
                <FormItem>
                  <Button @click="handleSubmit" type="primary" >保存</Button>
                  <Button @click="handleReset" style="margin-left: 8px">重置</Button>
                </FormItem>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col span="24">
              <Divider orientation="left">操作资源</Divider>
              <Table  :columns="columns2" :data="actionData"></Table>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
  import {listConvertTree, updateTreeNode} from '@/libs/util'
  import {getMenus, updateMenu, addMenu, removeMenu} from '@/api/menu'
  import {getActions, updateAction, addAction, removeAction} from '@/api/action'
  export default {
    name: 'tree_table_page',
    data () {
      return {
        loading: true,
        selectTreeData: [],
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
            key: 'menuName'
          },
          {
            title: '操作',
            key: '',
            type: 'template',
            template: 'action'
          }
        ],
        columns2: [
          {
            title: '操作名称',
            key: 'actionName'
          },
          {
            title: '请求地址',
            key: 'path'
          }
        ],
        data: [],
        actionData:[]
      }
    },
    methods: {
      treeSelectNormalizer (node) {
        return {
          id: node.menuId,
          label: node.menuName,
          children: node.children
        }
      },
      handleEdit (data) {
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
          this.formItem = Object.assign({}, newData, data.row)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.formItem = newData
        }
       this.getActions(this.formItem.menuId)
        //重置验证
       this.handleReset()
      },
      handleReset () {
        this.$refs['menuForm'].resetFields();
      },
      handleSubmit () {
        this.$refs['menuForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.menuId) {
              updateMenu(this.formItem).then(res => {
                this.handleReset()
                this.getMenus()
              })
            } else {
              addMenu(this.formItem).then(res => {
                this.handleReset()
                this.getMenus()
              })
            }
          }
        })
      },
      handleRemoveMenu (data) {
        removeMenu({menuId: data.row.menuId}).then(res => {
          this.getMenus()
        })
      },
      setSelectTree (data) {
        const root = {
          menuId: '0',
          menuName: '根节点'
        }
        this.selectTreeData = [root].concat(data)
      },
      getMenus () {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
          this.data = listConvertTree(res.data.list, opt)
          this.setSelectTree(this.data)
        })
      },
      getActions (menuId) {
        getActions(menuId).then(res => {
          this.actionData = res.data.list
        })
      }
    },
    mounted: function () {
      this.getMenus()
    },
  }
</script>

<style>

</style>
