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
            <template slot="status" slot-scope="scope">
              <Badge v-if="scope.row.status===1" status="success" text="有效"/>
              <Badge v-else="" status="error" text="无效"/>
            </template>
          </tree-table>
        </Col>
        <div style="display: block;position: absolute;top: 0;bottom: 0;left: 25%;border-left: 1px solid #eee;"></div>
        <Col span="18">
          <Row>
            <Col span="24">
              <div class="search-con search-con-top">
                <ButtonGroup>
                  <Button type="primary" @click="setEnabled(true)">新建</Button>
                  <Button type="primary" :disabled="formItem.menuId?false:true" @click="setEnabled(false)">编辑</Button>
                  <Button type="primary" :disabled="formItem.menuId?false:true" @click="confirmModal = true">删除</Button>
                </ButtonGroup>
                <Modal
                  v-model="confirmModal"
                  title="提示"
                  @on-ok="handleRemove">
                  确定删除,菜单资源【{{formItem.menuName}}】吗?{{formItem.children && formItem.children.length > 0 ?
                  '存在子菜单,将一起删除.是否继续?' : ''}}

                </Modal>
              </div>
              <Form ref="menuForm" :model="formItem" :rules="formItemRules" :label-width="100">
                <FormItem label="父级菜单">
                  <treeselect :disabled="disabled"
                              v-model="formItem.parentId"
                              :options="selectTreeData"
                              :default-expand-level="1"
                              :normalizer="treeSelectNormalizer"/>
                </FormItem>
                <FormItem label="菜单标识" prop="menuCode">
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
                <FormItem label="图标">
                  <Input :disabled="disabled" v-model="formItem.icon" placeholder="请输入内容"></Input>
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
                  <Button :disabled="disabled" @click="handleSubmit" :loading="saving" type="primary">保存</Button>
                  <Button :disabled="disabled" @click="setEnabled(true)" style="margin-left: 8px">重置</Button>
                </FormItem>
              </Form>
              <Divider orientation="left">操作资源</Divider>
              <menu-action :value="formItem"></menu-action>
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
  import MenuAction from './menu-action'

  export default {
    name: 'SystemMenu',
    components: {
      MenuAction
    },
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('菜单标识不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线'))
        }  else {
          callback()
        }
      }
      return {
        confirmModal: false,
        disabled: true,
        saving: false,
        selectTreeData: [],
        formItemRules: {
          menuCode: [
            {validator: validateEn, trigger: 'blur'}
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
            title: '状态',
            key: 'status',
            type: 'template',
            template: 'status'
          },
        ],
        data: []
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
      setSelectTree (data) {
        const root = {
          menuId: 0,
          menuName: '根节点'
        }
        this.selectTreeData = [root].concat(data)
      },
      setEnabled (enabled) {
        if (enabled) {
          this.handleReset()
        }
        this.disabled = false
      },
      rowClick (data) {
        this.disabled = true
        this.handleReset()
        if (data) {
          this.formItem = Object.assign({}, data.row)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        }
      },
      handleReset () {
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
        this.saving = false
      },
      handleSubmit () {
        this.$refs['menuForm'].validate((valid) => {
          if (valid) {
            this.saving = true
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.menuId) {
              updateMenu(this.formItem).then(res => {
                if (res.code === 0) {
                  this.disabled = true
                  this.$Message.success('保存成功')
                }
                this.handleSearch()
              }).finally(() =>{
                this.saving = false
              })
            } else {
              addMenu(this.formItem).then(res => {
                if (res.code === 0) {
                  this.disabled = true
                  this.$Message.success('保存成功')
                }
                this.handleSearch()
              }).finally(() =>{
                this.saving = false
              })
            }
          }
        })
      },
      handleRemove () {
        removeMenu({menuId: this.formItem.menuId}).then(res => {
          this.handleReset()
          this.handleSearch()
          if (res.code === 0) {
            this.$Message.success('删除成功')
          }
        })
      },
      handleSearch () {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
          this.data = listConvertTree(res.data.list, opt)
          this.setSelectTree(this.data)
        })
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
