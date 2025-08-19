// 默认Markdown模板
const DEFAULT_TEMPLATE = `### 🏆 GitHub成就
![GitHub Stats](https://github-readme-stats.vercel.app/api?username={username}&theme=dark&show_icons=true&hide_border=true)
`;

// 创建弹出卡片元素
function createPopupElement() {
  const popup = document.createElement('div');
  popup.className = 'gh-user-popup';
  popup.innerHTML = `
    <div class="gh-markdown-content"></div>
  `;
  document.body.appendChild(popup);
  return popup;
}

// 获取GitHub用户数据
async function fetchUserData(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('API请求失败');
    return await response.json();
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return null;
  }
}

// 显示用户弹窗
async function showUserPopup(username, x, y, popup) {
  // 获取用户数据
  const userData = await fetchUserData(username);
  if (!userData) return;
  
  // 更新弹窗内容

  // 获取并渲染Markdown模板
  chrome.storage.sync.get(['markdownTemplate'], function(result) {
    const template = result.markdownTemplate || DEFAULT_TEMPLATE;
    const userContent = template.replace(/{username}/g, username);
    popup.querySelector('.gh-markdown-content').innerHTML = marked.parse(userContent);
  });
  
  // 定位并显示弹窗
  positionPopup(popup, x, y);
  popup.classList.add('visible');
}

// 隐藏用户弹窗
function hideUserPopup(popup) {
  popup.classList.remove('visible');
}

// 定位弹窗
function positionPopup(popup, x, y) {
  // 防止弹窗超出屏幕
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;
  
  let posX = x + 20;
  let posY = y + 20;
  
  // 右侧空间不足
  if (x + popupWidth + 40 > viewportWidth) {
    posX = x - popupWidth - 20;
  }
  
  // 底部空间不足
  if (y + popupHeight + 40 > viewportHeight) {
    posY = y - popupHeight - 20;
  }
  
  popup.style.left = `${posX}px`;
  popup.style.top = `${posY}px`;
}

// 提取用户名
function extractUsername(element) {
  // 从URL中提取用户名
  const href = element.href;
  if (!href || !href.includes('github.com')) return null;
  
  // GitHub用户URL模式: https://github.com/username
  const match = href.match(/github\.com\/([^\/\?]+)(?:\/|\?|$)/);
  return match ? match[1] : null;
}

// 主函数
function init() {
  const popup = createPopupElement();
  let currentHoverElement = null;
  let hoverTimeout = null;
  
  // 监听所有链接的鼠标事件
  document.addEventListener('mouseover', function(e) {
    // 查找最近的链接元素
    let target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
      if (!target) return;
    }
    
    // 如果已经在当前元素上悬停，不做任何操作
    if (currentHoverElement === target) return;
    currentHoverElement = target;
    
    // 清除之前的定时器
    if (hoverTimeout) clearTimeout(hoverTimeout);
    
    // 提取用户名
    const username = extractUsername(target);
    if (!username) return;
    
    // 设置延迟显示，避免鼠标快速划过时触发
    hoverTimeout = setTimeout(() => {
      showUserPopup(username, e.clientX, e.clientY, popup);
    }, 300);
  });
  
  // 鼠标移出链接
  document.addEventListener('mouseout', function(e) {
    let target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
      if (!target) return;
    }
    
    if (currentHoverElement === target) {
      currentHoverElement = null;
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // 设置延迟隐藏，避免鼠标移动到弹窗上时关闭
      setTimeout(() => {
        if (!popup.matches(':hover')) {
          hideUserPopup(popup);
        }
      }, 300);
    }
  });
  
  // 鼠标移出弹窗时隐藏
  popup.addEventListener('mouseleave', function() {
    hideUserPopup(popup);
  });
  
  // 点击弹窗外部关闭
  document.addEventListener('click', function(e) {
    if (popup.classList.contains('visible') && 
        !popup.contains(e.target) &&
        currentHoverElement !== e.target) {
      hideUserPopup(popup);
    }
  });
  
  // 鼠标移动时更新弹窗位置
  document.addEventListener('mousemove', function(e) {
    if (popup.classList.contains('visible') && currentHoverElement) {
      positionPopup(popup, e.clientX, e.clientY);
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);