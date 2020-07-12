import proxy from 'http-proxy-middleware';

module.exports = function(app) {
  const headers  = {
    "Content-Type": "application/json",
  }
  app.use(proxy("/prod", {
    target: "https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/",
    changeOrigin: true,
    secure: false,
    headers: headers
  }));
};
