<template>
  <div>
    <Card shadow>
      <div  class="search-con search-con-top">
        <Button  class="search-btn" type="primary"><Icon type="search"/>&nbsp;&nbsp;添加</Button>
      </div>
      <tree-table expand-key="menuName" :expand-type="false" :is-fold="false" :selectable="false" :columns="columns" :data="data" >
        <template slot="likes" slot-scope="scope">
          <a @click="handle(scope)">编辑</a>
        </template>

      </tree-table>
    </Card>
  </div>
</template>

<script>
  import { listConvertTree } from '@/libs/util'
  import { getMenus } from '@/api/menu'
  import '_c/common/common.less';
  export default {
    name: 'tree_table_page',
    data () {
      return {
        columns: [
          {
            title: '菜单名称',
            key: 'menuName',
            minWidth: '50px'
          },
          {
            title: '菜单编码',
            key: 'menuCode',
            minWidth: '50px'
          },
          {
            title: '上级菜单',
            key: 'parentId',
            minWidth: '50px'
          },
          {
            title: '地址',
            key: 'url',
            minWidth: '200px'
          },
          {
            title: '状态',
            key: 'status',
          },
          {
            title: '创建时间',
            key: 'createTime',
          },
          {
            title: '操作',
            key: '',
            minWidth: '200px',
            type: 'template',
            template: 'likes'
          }
        ],
        data: []
      }
    },
    created:function(){
      this.getMenus();
    },
    methods: {
      handle (scope) {
        console.log(scope)
      },
      getMenus() {
        getMenus().then(res => {
          let opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId'
          }
          this.data = listConvertTree(res.data.list, opt)
        })
      }
    }
  }
</script>

<style>

</style>
