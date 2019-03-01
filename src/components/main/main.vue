<template>
    <!-- <div style="height: 100%" class="layout-main-top">
       <Layout>
         <Header :style="{position: 'fixed', width: '100%'}">
           <Menu mode="horizontal" theme="dark" active-name="1">
             <div class="layout-main-logo"></div>
             <div class="layout-main-nav">
               <MenuItem name="1">
                 <Icon type="ios-navigate"></Icon>
                 Item 1
             </MenuItem>
               <MenuItem name="2">
                 <Icon type="ios-keypad"></Icon>
                 Item 2
             </MenuItem>
               <MenuItem name="3">
                 <Icon type="ios-analytics"></Icon>
                 Item 3
             </MenuItem>
               <MenuItem name="4">
                 <Icon type="ios-paper"></Icon>
                 Item 4
             </MenuItem>
             </div>
           </Menu>
           <header-bar :collapsed="collapsed" :screenWidth="screenWidth" @on-coll-change="handleCollapsedChange">
             <custom-bread-crumb style="display: inline-block;vertical-align: top;" v-show="screenWidth>768" show-icon :list="breadCrumbList"></custom-bread-crumb>
             <user :user-avatar="userAvatar" :user-name="userName" />
               <language v-if="$config.useI18n" @on-lang-change="setLocal" style="margin-right: 10px;" :lang="local"/>
               <error-store v-if="$config.plugin['error-store'] && $config.plugin['error-store'].showInHeader" :has-read="hasReadErrorPage" :count="errorCount"></error-store>
               <div style="margin-right: 10px;">
                 <Icon @click.native="value1 = true" type="md-settings" :size="23"></Icon>
               </div>
               <fullscreen  :screenWidth="screenWidth" v-model="isFullscreen" style="margin-right: 10px;"/>
           </header-bar>
         </Header>
         <Content :style="{margin: '88px 20px 0', background: '#fff', minHeight: '500px'}">
           Content
       </Content>
       </Layout>
     </div>-->

      <Layout style="height: 100%" class="layout-main-left">
        <Sider hide-trigger collapsible :width="256" :collapsed-width="64" v-model="collapsed" class="left-sider"
               :style="{overflow: 'hidden'}">
          <div class="layout-main-logo">
            <p v-show="!collapsed" class="logo-text" style="font-size: 20px">微服务开放平台</p>
            <p v-show="collapsed" class="logo-text" style="font-size:12px">开放平台</p>
            <!--  <img v-show="!collapsed" :src="maxLogo" key="max-logo" />
              <img v-show="collapsed" :src="minLogo" key="min-logo" />-->
          </div>
          <side-menu accordion ref="sideMenu" :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage"
                     :menu-list="menuList">
          </side-menu>
        </Sider>
        <Layout>
          <Header class="layout-main-header">
            <div :class="headerLogoClass">
              <!-- <img v-show="!collapsed" :src="maxLogo"  key="max-logo" />
               <img v-show="collapsed" :src="minLogo" key="min-logo" />-->
            </div>
              <sider-trigger :collapsed="collapsed" icon="md-menu" @on-change="handleCollapsedChange"></sider-trigger>
              <custom-bread-crumb class="layout-main-bread-crumb" v-show="screenWidth>768" show-icon :list="breadCrumbList"></custom-bread-crumb>
              <ul class="layout-main-header-bar">
                  <li>
                    <fullscreen :screenWidth="screenWidth" v-model="isFullscreen"/>
                  </li>
                  <li>
                    <Icon @click.native="value1 = true" type="md-settings" :size="23"></Icon>
                  </li>
                  <li>
                    <error-store v-if="$config.plugin['error-store'] && $config.plugin['error-store'].showInHeader"  :has-read="hasReadErrorPage" :count="errorCount"></error-store>
                  </li>
                  <li>
                    <language v-if="$config.useI18n" @on-lang-change="setLocal" style="margin-right: 10px;" :lang="local"/>
                  </li>
                  <li>
                    <user :user-avatar="userAvatar" :user-name="userName"/>
                  </li>
              </ul>
          </Header>
          <Content :class="mainClass">
            <Layout class="layout-main-content-wrapper">
              <div class="layout-main-tag-nav-wrapper">
                <tags-nav :value="$route" @input="handleClick" :list="tagNavList" @on-close="handleCloseTag"/>
              </div>
              <Content class="layout-main-view-wrapper">
                <keep-alive :include="cacheList">
                  <router-view/>
                </keep-alive>
                <ABackTop :height="100" :bottom="80" :right="50" container=".layout-main-view-wrapper"></ABackTop>
              </Content>
            </Layout>
          </Content>
        </Layout>
        <Drawer :closable="false" width="300" v-model="value1">
          <h3>导航布局</h3>
          <div>
            <p style="display: inline-block;margin-left: 20px"><img src="../../assets/images/layout-left.svg"/></p>
            <p style="display: inline-block;margin-left: 20px"><img src="../../assets/images/layout-top.svg"/></p>
          </div>
        </Drawer>
      </Layout>

</template>

<script>
  import SideMenu from './components/side-menu'
  import HeaderBar from './components/header-bar'
  import TagsNav from './components/tags-nav'
  import User from './components/user'
  import ABackTop from './components/a-back-top'
  import Fullscreen from './components/fullscreen'
  import Language from './components/language'
  import ErrorStore from './components/error-store'
  import siderTrigger from './components/header-bar/sider-trigger'
  import customBreadCrumb from './components/header-bar/custom-bread-crumb'
  import {mapMutations, mapActions, mapGetters} from 'vuex'
  import {getNewTagList, getNextRoute, routeEqual} from '@/libs/util'
  import minLogo from '@/assets/images/logo-min.jpg'
  import maxLogo from '@/assets/images/logo.jpg'
  import './main.less'
  import Layout from "../../../node_modules/iview/src/components/layout/layout";
  export default {
    name: 'Main',
    components: {
      Layout, SideMenu,
      HeaderBar,
      Language,
      TagsNav,
      Fullscreen,
      ErrorStore,
      User,
      ABackTop,
      customBreadCrumb,
      siderTrigger
    },
    data () {
      return {
        value1: false,
        collapsed: false,
        minLogo,
        maxLogo,
        isFullscreen: false,
        screenWidth: 0
      }
    },
    computed: {
      ...mapGetters([
        'errorCount'
      ]),
      breadCrumbList () {
        return this.$store.state.app.breadCrumbList
      },
      headerLogoClass () {
        return [
          'layout-main-header-logo',
          this.collapsed ? 'layout-main-header-logo-collapsed' : ''
        ]
      },
      mainClass () {
        return [
          'layout-main-content',
          this.collapsed ? 'layout-main-content-collapsed' : ''
        ]
      },
      tagNavList () {
        return this.$store.state.app.tagNavList
      },
      tagRouter () {
        return this.$store.state.app.tagRouter
      },
      userAvatar () {
        return this.$store.state.user.avatarImgPath
      },
      userName () {
        return this.$store.state.user.nickName
      },
      cacheList () {
        return this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []
      },
      menuList () {
        return this.$store.getters.menuList
      },
      local () {
        return this.$store.state.app.local
      },
      hasReadErrorPage () {
        return this.$store.state.app.hasReadErrorPage
      }
    },
    methods: {
      ...mapMutations([
        'setBreadCrumb',
        'setTagNavList',
        'addTag',
        'setLocal'
      ]),
      ...mapActions([
        'handleLogin'
      ]),
      turnToPage (route) {
        let {name, params, query} = {}
        if (typeof route === 'string') name = route
        else {
          name = route.name
          params = route.params
          query = route.query
        }
        if (name.indexOf('isTurnByHref_') > -1) {
          window.open(name.split('_')[1])
          return
        }
        this.$router.push({
          name,
          params,
          query
        })
      },
      handleCollapsedChange (state) {
        this.collapsed = state
      },
      handleCloseTag (res, type, route) {
        if (type === 'all') {
          this.turnToPage(this.$config.homeName)
        } else if (routeEqual(this.$route, route)) {
          if (type !== 'others') {
            const nextRoute = getNextRoute(this.tagNavList, route)
            this.$router.push(nextRoute)
          }
        }
        this.setTagNavList(res)
      },
      handleClick (item) {
        this.turnToPage(item)
      }
    },
    watch: {
      screenWidth(val) {
        if (val < 768) {
          // 小于768强制折叠
          this.handleCollapsedChange(true)
        } else {
          this.handleCollapsedChange(false)
        }
      },
      '$route' (newRoute) {
        const {name, query, params, meta} = newRoute
        this.addTag({
          route: {name, query, params, meta},
          type: 'push'
        })
        this.setBreadCrumb(newRoute)
        this.setTagNavList(getNewTagList(this.tagNavList, newRoute))
        this.$refs['sideMenu'].updateOpenName(newRoute.name)
      }
    },
    mounted () {
      const that = this
      // 宽度适应
      that.screenWidth = document.body.clientWidth
      window.onresize = () => {
        return (() => {
          that.screenWidth = document.body.clientWidth
        })()
      }

      // 初始化设置面包屑导航和标签导航
      this.setTagNavList()
      this.addTag({
        route: this.$store.state.app.homeRoute
      })
      this.setBreadCrumb(this.$route)
      // 设置初始语言
      this.setLocal(this.$i18n.locale)
      // 如果当前打开页面不在标签栏中，跳到homeName页
      if (!this.tagNavList.find(item => item.name === this.$route.name)) {
        this.$router.push({
          name: this.$config.homeName
        })
      }
    }
  }
</script>
