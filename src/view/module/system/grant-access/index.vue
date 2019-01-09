<template>
  <div>
    <Alert show-icon>网关服务：动态访问权限控制,需开启动态权限验证(opencloud.gateway.enabled-validate-access=true)。角色或应用授权资源后需要手动刷新网关。否则不生效！&nbsp;&nbsp;<a @click="handleRefreshGateway">一键刷新网关</a>
      <br>
    <code>开放API接口安全。使用标准Oauth2进行身份认证、接口调用鉴权、参数签名验证.</code>
    </Alert>
    <Card shadow>
    <Table :columns="columns" :data="data" :loading="loading">
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success" text="有效"/>
        <Badge v-else="" status="error" text="无效"/>
      </template>
      <template slot="resourceType" slot-scope="{ row }">
        <span v-if="row.resourceType==='api'">接口</span>
        <span v-else-if="row.resourceType==='menu'">菜单</span>
        <span v-else-if="row.resourceType==='action'">操作</span>
        <span v-else="">{{row.resourceType}}</span>
        <span>&nbsp;/&nbsp;{{row.resourceId}}</span>
      </template>
      <template slot="authorityPrefix" slot-scope="{ row }">
        <span v-if="row.authorityPrefix==='USER_'">用户</span>
        <span v-else-if="row.authorityPrefix==='ROLE_'">角色</span>
        <span v-else-if="row.authorityPrefix==='APP_'">应用</span>
        <span v-else="">{{row.authorityPrefix}}</span>
        <span>&nbsp;/&nbsp;{{row.authorityOwner}}</span>
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
  import {refreshGateway} from '@/api/gateway'
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
            title: '访问对象 / ID',
            key: 'authorityPrefix',
            slot: 'authorityPrefix'
          },
          {
            title: '授权资源 / ID',
            key: 'resourceType',
            slot: 'resourceType'
          },
          {
            title: '资源所属服务',
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
      },
      handleRefreshGateway(){
        this.$Modal.confirm({
          title: '确定刷新网关吗？',
          onOk: () => {
            refreshGateway().then(res => {
              if (res.code === 0) {
                this.$Message.success('刷新成功')
              }
            })
          }
        })
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
