<template>
  <div>
    <Card shadow>
      <Row :gutter="16">
        <Col span="6">
          <tree-table height="900"
                      expand-key="menuName"
                      @radio-click="rowClick"
                      :expand-type="false"
                      :is-fold="false"
                      :tree-type="true"
                      :selectable="false"
                      :columns="columns"
                      :data="data">
          </tree-table>
        </Col>
        <div style="display: block;position: absolute;top: 0;bottom: 0;left: 25%;border: 1px dashed #eee;"></div>
        <Col span="18">
          <Row>
            <Col span="18">
              <div class="search-con search-con-top">
                <ButtonGroup size="small">
                  <Button type="primary" @click="setEnabled(true)">新增</Button>
                  <Button type="primary" :disabled="formItem.menuId?false:true" @click="setEnabled(false)">编辑
                  </Button>
                  <Button type="primary" :disabled="formItem.menuId?false:true" @click="remove()">删除</Button>
                </ButtonGroup>
              </div>
              <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="80">
                <FormItem label="父级菜单" prop="parentId">
                  <treeselect :disabled="disabled"
                              v-model="formItem.parentId"
                              :options="selectTreeData"
                              :default-expand-level="1"
                              :normalizer="treeSelectNormalizer"/>
                </FormItem>
                <FormItem label="菜单编码" prop="menuCode">
                  <Input :disabled="disabled" v-model="formItem.menuCode" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem label="菜单名称" prop="menuName">
                  <Input :disabled="disabled" v-model="formItem.menuName" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem label="请求地址" prop="path">
                  <Input :disabled="disabled" v-model="formItem.path" placeholder="请输入内容">
                    <Select :disabled="disabled" v-model="formItem.prefix" slot="prepend" style="width: 80px">
                      <Option value="/">/</Option>
                      <Option value="http://">http://</Option>
                      <Option value="https://">https://</Option>
                    </Select>
                    <Select :disabled="disabled" v-model="formItem.target" slot="append" style="width: 100px">
                      <Option value="_self">窗口内打开</Option>
                      <Option value="_blank">新窗口打开</Option>
                    </Select>
                  </Input>
                </FormItem>
                <FormItem label="优先级">
                  <InputNumber :disabled="disabled" v-model="formItem.priority"></InputNumber>
                </FormItem>
                <FormItem label="状态">
                  <i-switch :disabled="disabled" v-model="formItem.statusSwatch" size="large">
                    <span slot="open">有效</span>
                    <span slot="close">无效</span>
                  </i-switch>
                </FormItem>
                <FormItem label="描述">
                  <Input :disabled="disabled" v-model="formItem.menuDesc" type="textarea" placeholder="请输入内容"></Input>
                </FormItem>
                <FormItem>
                  <Button :disabled="disabled" @click="submit" type="primary">保存</Button>
                  <Button :disabled="disabled" @click="reset" style="margin-left: 8px">重置</Button>
                </FormItem>
              </Form>
              <Divider orientation="left">操作资源</Divider>
              <div class="search-con search-con-top">
                <ButtonGroup size="small">
                  <Button class="search-btn" type="primary" @click="rowClick()">
                    <Icon type="search"/>&nbsp;&nbsp;新增
                  </Button>
                </ButtonGroup>
              </div>
              <Table :columns="columns2" :data="actionData"></Table>
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
        disabled: true,
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
            key: 'menuName',
            minWidth: '200px'
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
        actionData: []
      }
    },
    methods: {
      treeSelectNormalizer(node) {
        return {
          id: node.menuId,
          label: node.menuName,
          children: node.children
        }
      },
      setSelectTree (data) {
        const root = {
          menuId: '0',
          menuName: '根节点'
        }
        this.selectTreeData = [root].concat(data)
      },
      setEnabled (reset) {
        if (reset) {
          this.reset()
        }
        this.disabled = false
      },
      rowClick (data) {
        this.disabled = true
        if (data) {
          this.formItem = data.row
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
          this.getActions(this.formItem.menuId)
        }
      },
      reset () {
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
        this.formItem = newData
        this.$refs['menuForm'].resetFields()
      },
      submit () {
        this.$refs['menuForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.menuId) {
              updateMenu(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.reset()
                this.getMenus()
              })
            } else {
              addMenu(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.reset()
                this.getMenus()
              })
            }
          }
        })
      },
      remove () {
        removeMenu({menuId: this.formItem.menuId}).then(res => {
          if (res.code === 0) {
            this.$Message.success('删除成功')
          }
          this.getMenus()
          this.reset()
        })
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
        if (!menuId) {
          this.actionData = []
          return
        }
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
