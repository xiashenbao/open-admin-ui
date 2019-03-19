<template>
  <div>
    <Card shadow>
    <Table :columns="columns" :data="data" :loading="loading">
      <template slot="httpStatus" slot-scope="{ row }">
        <Badge v-if="row.httpStatus==='200'" status="success"/>
        <Badge v-else="" status="error"/>{{row.httpStatus}}
      </template>
      <template  slot="detail" slot-scope="{ row }">
        <a @click="openDrawer(row)">详情</a>
      </template>
    </Table>
    <Page transfer :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
          show-total
          @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Drawer width="30" :closable="false" v-model="drawer">
      <div slot="header">
        <Badge v-if="currentRow.httpStatus==='200'" status="success"/>
        <Badge v-else="" status="error"/>{{currentRow.httpStatus}}
        {{currentRow.path}}
      </div>
      <div>
        <h3>请求头

        </h3>
        <pre>
             {{ currentRow.headers ?  JSON.stringify(JSON.parse(currentRow.headers), null, 2):''}}
        </pre>
        <h3>请求参数</h3>
        <pre>
              {{ currentRow.params ? JSON.stringify(JSON.parse(currentRow.params), null, 2) : ''}}
        </pre>
        <h3>认证信息</h3>
        <pre>
              {{ currentRow.authentication ? JSON.stringify(JSON.parse(currentRow.authentication), null, 2) : ''}}
        </pre>
      </div>
    </Drawer>
  </div>
</template>

<script>
  import {getAccessLogs} from '@/api/gateway'
  import {readUserAgent} from '@/libs/util'
  export default {
    name: 'GatewayAccessLog',
    data () {
      return {
        drawer:false,
        currentRow:{},
        loading: false,
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '请求地址',
            key: 'path',
            width: 220
          },
          {
            title: '请求方式',
            key: 'method',
            width: 100
          },
          {
            title: 'IP',
            key: 'ip',
            width: 200
          },
          {
            title: '终端',
            width: 250,
            render:(h,params) => {
              return   h('div', readUserAgent(params.row.userAgent).terminal)
            }
          },
          {
            title: '浏览器',
            width: 250,
            render:(h,params) => {
              return   h('div', readUserAgent(params.row.userAgent).browser)
            }
          },
          {
            title: '响应状态',
            key: 'httpStatus',
            slot: 'httpStatus',
            width: 100
          },
          {
            title: '耗时',
            key: 'useTime',
            render:(h,params) => {
              return   h('div',( params.row.useTime?params.row.useTime:0)+' ms')
            },
            width: 100
          },
          {
            title: '请求时间',
            key: 'requestTime',
            width: 200
          },
          {
            title: '详情',
            slot: 'detail',
            fixed:'right',
            width: 120
          }
        ],
        data: []
      }
    },
    methods: {
      openDrawer(data){
        this.currentRow = data
        this.drawer = true
      },
      handleSearch () {
        this.loading = true
        getAccessLogs({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
        }).finally(() =>{
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
