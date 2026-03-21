import { Router } from 'vue-router';

/**
 * 修复路由 hash 中的 query 参数，在初始url带query的情况下，hash 模式query会获取不到
 * 前置hash，避免获取不到query参数，更符合实际业务场景
 * 路由模式非hash模式时，不需要用此方法
 * @param router 路由实例
 */
export const routerHashFixQuery = (router: Router): Router => {
  // 全局前置守卫
  router.beforeEach((to, _from, next) => {
    try {
      const href = window.location.href;

      // 只有同时存在 ? 和 # 才需要处理
      if (!href.includes('?') || !href.includes('#')) {
        return next();
      }

      const queryIndex = href.indexOf('?');
      const hashIndex = href.indexOf('#');

      // ==========================================
      // 只有 ? 在 # 前面 才处理
      // ==========================================
      if (queryIndex > hashIndex) {
        return next();
      }

      // ==========================================
      // 开始安全解析
      // ==========================================
      const [baseWithQuery, ...hashFragments] = href.split('#');
      const hashPart = hashFragments.join('#'); // 兼容 # 里带 # 的极端情况
      const [base, queryStr = ''] = baseWithQuery.split('?');

      // 解析 hash 内部原有 query
      const [hashPath, hashQueryStr = ''] = hashPart.split('?');

      // 解析前后两个 query
      const urlParams = new URLSearchParams(queryStr);
      const hashParams = new URLSearchParams(hashQueryStr);

      // ==========================================
      // 合并参数（后面的覆盖前面的）
      // ==========================================
      const mergedQuery = {};
      for (const [key, value] of urlParams) mergedQuery[key] = value;
      for (const [key, value] of hashParams) mergedQuery[key] = value;

      // 拼接新的正确 hash
      const newQueryStr = new URLSearchParams(mergedQuery).toString();
      const finalHash = hashPath + (newQueryStr ? `?${newQueryStr}` : '');
      const finalUrl = `${base}#${finalHash}`;

      // ==========================================
      // 替换 URL（不刷新、不跳转）
      // ==========================================
      window.history.replaceState(null, null, finalUrl);

      // ==========================================
      // 交给路由正确解析 query（避免死循环）
      // ==========================================
      return next({
        path: to.path,
        query: mergedQuery,
        replace: true,
      });
    } catch (e) {
      // 健壮性：出错了直接放行，不阻塞业务
      console.warn('URL 修复异常:', e);
      return next();
    }
  });

  return router;
};
