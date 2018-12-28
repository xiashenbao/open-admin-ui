<template>
  <div>
    <div class="search-con search-con-top">
      <ButtonGroup size="small">
        <Button  class="search-btn" type="primary" @click="openModal()">
          <Icon type="search"/>&nbsp;&nbsp;新增
        </Button>
      </ButtonGroup>
    </div>
    <Table :columns="columns" :data="data">
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success" text="有效"/>
        <Badge v-else="" status="default" text="无效"/>
      </template>
      <template slot="action" slot-scope="{ row }">
        <a @click="openModal(row)">
          编辑</a>&nbsp;
        <Poptip
          confirm
          title="确定删除吗?"
          @on-ok="removeRole(row)">
          <a>删除</a>
        </Poptip>&nbsp;
        <Dropdown @on-click="handleClick">
          <a href="javascript:void(0)">
            授权
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem name="grantMenu">菜单授权</DropdownItem>
            <DropdownItem name="grantApi">接口授权</DropdownItem>
          </DropdownMenu>
        </Dropdown>&nbsp;
      </template>
    </Table>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-ok="submitForm"
           @on-cancel="resetForm">
      <Form ref="roleForm" :model="formItem" :rules="formItemRules" :label-width="80">
        <FormItem label="角色编码" prop="roleCode">
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
    </Modal>
  </div>
</template>

<script>
  import {getRoles, updateRole, addRole, removeRole} from '@/api/role'

  export default {
    name: 'Role',
    data () {
      return {
        modalVisible: false,
        modalTitle: '',
        spinShow:false,
        confirmModal: false,
        formItemRules: {
          roleCode: [
            {required: true, message: '角色编码不能为空', trigger: 'blur'}
          ],
          roleName: [
            {required: true, message: '角色名称不能为空', trigger: 'blur'}
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
          roleDesc: ''
        },
        columns: [
          {
            title: '角色名称',
            key: 'roleName'
          },
          {
            title: '角色编码',
            key: 'roleCode'
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '描述',
            key: 'roleDesc'
          },
          {
            title: '更新时间',
            key: 'updateTime'
          },
          {
            title: '角色',
            slot: 'action',
            width: 200
          }
        ],
        data: []
      }
    },
    methods: {
      openModal (data) {
        const newData = {
          roleId: '',
          roleCode: '',
          roleName: '',
          path: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          roleDesc: ''
        }
        if (data) {
          this.modalTitle = '编辑角色'
          this.formItem = Object.assign({}, newData, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加角色'
          this.formItem = newData
        }
        this.modalVisible = true
      },
      resetForm () {
        //重置验证
        this.$refs['roleForm'].resetFields()
      },
      submitForm () {
        this.$refs['roleForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.roleId) {
              updateRole(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.resetForm()
                this.getRoles()
              })
            } else {
              addRole(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.resetForm()
                this.getRoles()
              })
            }
          }
        })
      },
      getRoles () {
        getRoles().then(res => {
          this.data = res.data.list
        })
      },
      removeRole (data) {
        removeRole({roleId: data.roleId}).then(res => {
          if (res.code === 0) {
            this.$Message.success('删除成功')
          }
          this.getRoles()
        })
      },
      handleClick (name) {
          console.log(name)
        switch (name) {
          case 'logout':
            break
        }
      }
    },
    mounted: function () {
      this.getRoles()
    }
  }
</script>
