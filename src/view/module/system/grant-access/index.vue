<template>
  <div>
    <Alert show-icon>已授权资源访问列表
    </Alert>
    <Card shadow>
    <Table :columns="columns" :data="data" :loading="loading">
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success" text="有效"/>
        <Badge v-else="" status="default" text="无效"/>
      </template>
      <template slot="resourceType" slot-scope="{ row }">
        <span v-if="row.resourceType==='api'">接口</span>
        <span v-else-if="row.resourceType==='menu'">菜单</span>
        <span v-else-if="row.resourceType==='action'">操作</span>
        <span v-else="">{{row.resourceType}}</span>
      </template>
      <template slot="authorityPrefix" slot-scope="{ row }">
        <span v-if="row.authorityPrefix==='USER_'">用户</span>
        <span v-else-if="row.authorityPrefix==='ROLE_'">角色</span>
        <span v-else-if="row.authorityPrefix==='APP_'">应用</span>
        <span v-else="">{{row.authorityPrefix}}</span>
      </template>
    </Table>
    <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
          show-total
          @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
  </div>
</template>

<script>
  import {getGrantAccess} from '@/api/grant-access'

  export default {
    name: 'SystemGrantAccess',
    data () {
      return {
        loading: false,
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        columns: [
          {
            title: '访问路径',
            key: 'path'
          },
          {
            title: '访问权限',
            key: 'authority'
          },
          {
            title: '访问对象',
            key: 'authorityPrefix',
            slot: 'authorityPrefix'
          },
          {
            title: '资源ID',
            key: 'resourceId'
          },
          {
            title: '资源类型',
            key: 'resourceType',
            slot: 'resourceType'
          },
          {
            title: '资源服务器',
            key: 'serviceId'
          },
          {
            title: '状态',
            key: 'status',
            slot: 'status'
          }
        ],
        data: []
      }
    },
    methods: {
      handleSearch () {
        this.loading = true
        getGrantAccess({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
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
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
