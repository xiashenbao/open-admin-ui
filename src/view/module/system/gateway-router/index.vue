<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup size="small">
          <Button  class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新增
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="default" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Dropdown ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="grantMenu">菜单授权</DropdownItem>
              <DropdownItem name="grantApi">接口授权</DropdownItem>
              <DropdownItem name="remove">删除</DropdownItem>
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
           @on-ok="handleSubmit"
           @on-cancel="handleReset">
      <Form ref="roleForm" :model="formItem" :rules="formItemRules" :label-width="100">
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
    </Modal>
  </div>
</template>

<script>
  import {getRoles, updateRole, addRole, removeRole} from '@/api/role'

  export default {
    name: 'SystemGatewayRoute',
    data () {
      return {
        loading :false,
        modalVisible: false,
        modalTitle: '',
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
        data: []
      }
    },
    methods: {
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑角色'
          this.formItem = Object.assign({},  this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
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
          roleDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.$refs['roleForm'].resetFields()
      },
      handleSubmit () {
        this.$refs['roleForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.roleId) {
              updateRole(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              })
            } else {
              addRole(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
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
              if (res.code === 0) {
                this.pageInfo.page=1
                this.$Message.success('删除成功')
              }
              this.handleSearch()
            })
          }
        });
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
    }
  }
</script>
