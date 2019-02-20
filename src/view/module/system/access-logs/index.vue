<template>
  <div>
    <Card shadow>
    <Table :columns="columns" :data="data" :loading="loading">
      <template slot="httpStatus" slot-scope="{ row }">
        <Badge v-if="row.httpStatus==='200'" status="success"/>
        <Badge v-else="" status="error"/>
        {{row.httpStatus}}
      </template>
      <template  slot="headers" slot-scope="{ row }">
        <Tooltip max-width="200" :content="row.headers">
          <Button>查看</Button>
        </Tooltip>
      </template>
      <template  slot="data" slot-scope="{ row }">
        <Tooltip max-width="200" :content="row.data">
          <Button>查看</Button>
        </Tooltip>
      </template>
    </Table>
    <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
          show-total
          @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
  </div>
</template>

<script>
  import {getAccessLogs} from '@/api/access-logs'
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
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '访问路径',
            key: 'path'
          },
          {
            title: '访问时间',
            key: 'accessTime'
          },
          {
            title: '请求方式',
            key: 'method'
          },
          {
            title: 'IP',
            key: 'ip'
          },
          {
            title: '请求头',
            key: 'headers',
            slot: 'headers'
          },
          {
            title: '请求数据',
            key: 'data',
            slot: 'data'
          },
          {
            title: '响应状态',
            key: 'httpStatus',
            slot: 'httpStatus'
          }
        ],
        data: []
      }
    },
    methods: {
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
