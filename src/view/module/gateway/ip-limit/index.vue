<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;添加
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="policyType" slot-scope="{ row }">
          <Tag color="green" v-if="row.policyType===1">允许-白名单</Tag>
          <Tag color="red" v-else="">拒绝-黑名单</Tag>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <a @click="handleModal(row,forms[1])">
            绑定API
          </a>
          &nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="remove">删除</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="800"
           @on-cancel="handleReset">
      <Form ref="form1" v-show="current=='form1'" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="策略名称" prop="policyName">
          <Input v-model="formItem.policyName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="策略类型" prop="policyType">
          <Select v-model="formItem.policyType">
            <Option value="0" label="拒绝-黑名单"></Option>
            <Option value="1" label="允许-白名单"></Option>
          </Select>
        </FormItem>
        <FormItem label="IP地址" prop="ipAddress">
          <Input v-model="formItem.ipAddress" type="textarea" placeholder="请输入内容"></Input> 多个用;隔开
        </FormItem>
      </Form>
      <Form ref="form2" v-show="current=='form2'" :model="formItem" :rules="formItemRules" :label-width="100">
        <Alert type="warning" show-icon>请注意：如果API上原来已经绑定了一个策略，则会被本策略覆盖，请慎重选择！</Alert>
        <FormItem label="绑定接口(选填)" prop="authorities">
          <Transfer
            :data="selectApis"
            :list-style="{width: '300px',height: '500px'}"
            :titles="['选择接口', '已选择接口']"
            :render-format="transferRender"
            :target-keys="formItem.apiIds"
            @on-change="handleTransferChange"
            filterable>
          </Transfer>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="saving" @click="handleSubmit">保存</Button>&nbsp;
        <Button type="default" @click="handleReset">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getIpLimits, addIpLimit, updateIpLimit, removeIpLimit, getIpLimitApis, addIpLimitApis} from '@/api/ipLimit'
  import {getApiAuthorityList} from '@/api/authority'

  export default {
    name: 'GatewayRoute',
    data () {
      return {
        loading: false,
        saving: false,
        modalVisible: false,
        modalTitle: '',
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        current: 'form1',
        forms: [
          'form1',
          'form2'
        ],
        selectApis: [],
        formItemRules: {
          policyName: [
            {required: true, message: '策略名称不能为空', trigger: 'blur'}
          ],
          policyType: [
            {required: true, message: '策略类型不能为空', trigger: 'blur'}
          ],
          ipAddress: [
            {required: true,message: 'Ip地址不能为空',  trigger: 'blur'}
          ]
        },
        formItem: {
          policyId: '',
          policyName: '',
          policyType: '0',
          ipAddress: '',
          apiIds: [],
        },
        columns: [
          {
            title: '策略名称',
            key: 'policyName',
            width: 350
          },
          {
            title: '策略类型',
            width: 300,
            slot: 'policyType'
          },
          {
            title: 'IP地址',
            key: 'ipAddress',
            width: 550
          },
          {
            title: '最后修改时间',
            width: 200,
            key: 'updateTime'
          },
          {
            title: '操作',
            slot: 'action',
            fixed: 'right',
            width: 200
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data, step) {
        if (data) {
          this.formItem = Object.assign({}, this.formItem, data)
        }
        if (!step) {
          step = this.forms[0]
        }
        if (step === this.forms[0]) {
          this.modalTitle = data ? '编辑IP策略 - ' + this.formItem.policyName : '添加IP策略'
          this.modalVisible = true
        }
        if (step === this.forms[1]) {
          this.modalTitle = data ? '绑定API - ' + this.formItem.policyName : '绑定API'
          this.handleIpLimitApi(this.formItem.policyId)
        }
        this.formItem.policyType = this.formItem.policyType + ''
        this.current = step
      },
      handleReset () {
        const newData = {
          policyId: '',
          policyName: '',
          policyType: '0',
          ipAddress: '',
          apiIds: []
        }
        this.formItem = newData
        //重置验证
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = this.forms[0]
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        if (this.current === this.forms[0]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              if (this.formItem.policyId) {
                updateIpLimit(this.formItem).then(res => {
                  this.handleReset()
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                  }
                }).finally(() => {
                  this.saving = false
                })
              } else {
                addIpLimit(this.formItem).then(res => {
                  this.handleReset()
                  this.handleSearch()
                  if (res.code === 0) {
                    this.$Message.success('保存成功')
                  }
                }).finally(() => {
                  this.saving = false
                })
              }
            }
          })
        }
        if (this.current === this.forms[1]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              addIpLimitApis({policyId: this.formItem.policyId, apiIds: this.formItem.apiIds}).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('绑定成功')
                }
              }).finally(() => {
                this.saving = false
              })
            }
          })
        }
      },
      handleSearch () {
        this.loading = true
        getIpLimits({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
        }).finally(() => {
          this.loading = false
        })
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      },
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '确定删除吗？',
          onOk: () => {
            removeIpLimit(data.policyId).then(res => {
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
              this.handleSearch()
            })
          }
        })
      },
      handleIpLimitApi (policyId) {
        if (!policyId) {
          return
        }
        const that = this
        const p1 = getApiAuthorityList()
        const p2 = getIpLimitApis(policyId)
        Promise.all([p1, p2]).then(function (values) {
          let res1 = values[0]
          let res2 = values[1]
          if (res1.code === 0) {
            res1.data.map(item => {
              item.key = item.apiId
              item.label = `${item.path} - ${item.apiName}(${item.serviceId})`
            })
            that.selectApis = res1.data
          }
          if (res2.code === 0) {
            res2.data.map(item => {
              that.formItem.apiIds.push(item.apiId)
            })
          }
          that.modalVisible = true
        })
      },
      transferRender (item) {
        return `<span  title="${item.label}">${item.label}`
      },
      handleTransferChange (newTargetKeys, direction, moveKeys) {
        if (newTargetKeys.indexOf('1') != -1) {
          this.formItem.apiIds = ['1']
        } else {
          this.formItem.apiIds = newTargetKeys
        }
      },
      handleClick (name, row) {
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
