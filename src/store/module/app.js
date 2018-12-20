import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead,
  formatRouters
} from '@/libs/util'
import beforeClose from '@/router/before-close'
import {saveErrorLogger} from '@/api/data'
import router from '@/router'
import routers from '@/router/routers'
import config from '@/config'
import routes from '../../router/routers'

const {homeName} = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: getHomeRoute(routers, homeName),
    local: localRead('local'),
    errorList: [],
    hasReadErrorPage: false,
    hasUserRoutes: false
  },
  getters: {
    menuList: (state, getters, rootState) => {
      let r = formatRouters(rootState.user.menus, rootState.user.access)
      if (!state.hasUserRoutes) {
        // 防止重复添加路由报错, 在这里添加路由最合适，和获取数据完全分开
        router.addRoutes(r)
        state.hasUserRoutes = true
      }
      return getMenuByRouter(routes.concat(r), rootState.user.access)
    },
    errorCount: state => state.errorList.length
  },
  mutations: {
    setHasUserRoutes (state, hasUserRoutes) {
      state.hasUserRoutes = hasUserRoutes
    },
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else {
        tagList = getTagNavListFromLocalstorage() || []
      }
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      if (route.meta && route.meta.beforeCloseName && route.meta.beforeCloseName in beforeClose) {
        new Promise(beforeClose[route.meta.beforeCloseName]).then(close => {
          if (close) {
            closePage(state, route)
          }
        })
      } else {
        closePage(state, route)
      }
    },
    addTag (state, {route, type = 'unshift'}) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') {
          state.tagNavList.push(router)
        } else {
          if (router.name === homeName) {
            state.tagNavList.unshift(router)
          } else {
            state.tagNavList.splice(1, 0, router)
          }
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },
    addError (state, error) {
      state.errorList.push(error)
    },
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    }
  },
  actions: {
    addErrorLog ({commit, rootState}, info) {
      if (!window.location.href.includes('error_logger_page')) commit('setHasReadErrorLoggerStatus', false)
      const {user: {token, userId, userName}} = rootState
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userId,
        userName
      }
      saveErrorLogger(info).then(() => {
        commit('addError', data)
      })
    }
  }
}
