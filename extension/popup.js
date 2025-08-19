// 默认Markdown模板
const DEFAULT_TEMPLATE = `
### 🏆 GitHub成就
![GitHub Stats](https://github-readme-stats.vercel.app/api?username={username}&theme=dark&show_icons=true&hide_border=true)
`;

document.addEventListener('DOMContentLoaded', function() {
  const markdownTemplate = document.getElementById('markdownTemplate');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');
  
  // 加载保存的模板
  chrome.storage.sync.get(['markdownTemplate'], function(result) {
    markdownTemplate.value = result.markdownTemplate || DEFAULT_TEMPLATE;
  });
  
  // 保存模板
  saveBtn.addEventListener('click', function() {
    chrome.storage.sync.set({ markdownTemplate: markdownTemplate.value }, function() {
      status.textContent = '设置已保存！';
      status.className = 'status success';
      
      // 3秒后隐藏状态消息
      setTimeout(function() {
        status.className = 'status';
      }, 3000);
    });
  });
});