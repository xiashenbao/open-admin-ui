<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
         <Alert show-icon>资源服务器启动后,自动扫描@RestController下的方法,并自动添加或更新到API资源列表中。无需手动维护！详情查看：com.github.lyd.common.annotation.AnnotationScan</Alert>
      </div>
      <tree-table expand-key="apiName"  :expand-type="false" :is-fold="false" :selectable="false" :columns="columns"
                  :data="data">
        <template slot="status" slot-scope="scope">
          <Tag v-if="scope.row.status===1" color="blue">有效</Tag>
          <Tag v-else="" color="default">无效</Tag>
        </template>
      </tree-table>
    </Card>
  </div>
</template>

<script>
  import {listConvertTree} from '@/libs/util'
  import {getApis, updateApi, addApi, removeApi} from '@/api/apis'

  export default {
    name: 'tree_table_page',
    data () {
      return {
        apiGroup: [
          {apiId: 'opencloud-base-producer', apiName: '基础服务',apiCode:'opencloud-base-producer', serviceId: '0',status:1},
          {apiId: 'opencloud-auth-producer', apiName: '认证服务',apiCode:'opencloud-auth-producer', serviceId: '0',status:1}
        ],
        columns: [
          {
            title: '名称',
            key: 'apiName',
            minWidth: '200px'
          },
          {
            title: '编码',
            key: 'apiCode',
            minWidth: '100px'
          },
          {
            title: '请求路径',
            key: 'path',
            minWidth: '200px'
          },
          {
            title: '状态',
            key: 'status',
            type: 'template',
            template: 'status'
          },
          {
            title: '描述',
            key: 'apiDesc',
            minWidth: '100px'
          },
          {
            title: '创建时间',
            key: 'createTime',
            minWidth: '100px'
          },
          {
            title: '更新时间',
            key: 'updateTime',
            minWidth: '100px'
          }
        ],
        data: []
      }
    },
    created: function () {
      this.getApis()
    },
    methods: {
      getApis () {
        getApis().then(res => {

          let opt = {
            primaryKey: 'apiId',
            parentKey: 'serviceId',
            startPid: '0'
          }
          this.data = listConvertTree(res.data.list.concat(this.apiGroup), opt)
        })
      }
    }
  }
</script>

<style>

</style>
