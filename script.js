// 在类外部定义格式化函数（全局可用）
function formatLargeNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) {
        return Math.round(num).toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else {
        return (num / 1000000000).toFixed(1) + 'B';
    }
}

class XiaohongshuDashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.renderStats();
        this.renderTable();
        this.bindEvents();
    }
    
    async loadData() {
        try {
            console.log('开始加载数据...');
            const response = await fetch('xiaohongshu_data.json');
            console.log('响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error('网络响应不正常: ' + response.status);
            }
            
            const result = await response.json();
            console.log('原始数据:', result);
            
            if (result.success && result.data) {
                // 修复：转换字符串为数字
                this.data = this.convertStringToNumbers(result.data.items);
                this.filteredData = [...this.data];
                
                console.log('处理后的数据:', this.data);
                console.log('数据条目数:', this.data.length);
                
                // 清空错误信息
                document.getElementById('notesTable').innerHTML = '';
                this.renderTable();
            } else {
                throw new Error('数据格式错误');
            }
        } catch (error) {
            console.error('数据加载失败:', error);
            document.getElementById('notesTable').innerHTML = 
                '<div class="error">❌ 数据加载失败: ' + error.message + '</div>';
        }
    }
    
    // 新增：转换字符串为数字的方法
    convertStringToNumbers(items) {
        return items.map(item => ({
            ...item,
            likes: parseInt(item.likes) || 0,
            comments: parseInt(item.comments) || 0,
            collects: parseInt(item.collects) || 0,
            shares: parseInt(item.shares) || 0
        }));
    }
    
    renderStats() {
        const totalNotes = this.filteredData.length;
        const totalLikes = this.filteredData.reduce((sum, note) => sum + (note.likes || 0), 0);
        
        const avgLikes = totalNotes > 0 ? totalLikes / totalNotes : 0;
        const formattedAvgLikes = formatLargeNumber(avgLikes);
        
        const videoNotes = this.filteredData.filter(note => note.note_type === '视频').length;
        const videoRatio = totalNotes > 0 ? Math.round((videoNotes / totalNotes) * 100) : 0;
        
        console.log('统计信息:', { totalNotes, totalLikes, avgLikes, videoRatio });
        
        document.getElementById('totalNotes').textContent = totalNotes;
        document.getElementById('avgLikes').textContent = formattedAvgLikes;
        document.getElementById('videoRatio').textContent = `${videoRatio}%`;
    }
    
    renderTable() {
        const notesTable = document.getElementById('notesTable');
        
        // 如果没有数据，显示提示
        if (this.filteredData.length === 0) {
            notesTable.innerHTML = '<div class="loading">暂无数据</div>';
            return;
        }
        
        let html = '<div class="note-item note-header">';
        html += '<div>标题</div><div>作者</div><div>点赞数</div><div>评论数</div><div>类型</div>';
        html += '</div>';
        
        this.filteredData.forEach(note => {
            const shortTitle = note.title && note.title.length > 50 
                ? note.title.substring(0, 50) + '...' 
                : note.title || '无标题';
            
            html += `
                <div class="note-item">
                    <div title="${note.title || ''}">${shortTitle}</div>
                    <div>${note.user_nickname || '未知用户'}</div>
                    <div>${formatLargeNumber(note.likes || 0)}</div>
                    <div>${note.comments || 0}</div>
                    <div>
                        <span class="${(note.note_type === '视频') ? 'video-badge' : 'text-badge'}">
                            ${note.note_type || '图文'}
                        </span>
                    </div>
                </div>
            `;
        });
        
        notesTable.innerHTML = html;
        console.log('表格渲染完成，条目数:', this.filteredData.length);
    }
    
    // 绑定事件的方法
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchNotes(e.target.value);
            });
        }
    }
    
    // 搜索功能
    searchNotes(keyword) {
        if (!keyword || !keyword.trim()) {
            this.filteredData = [...this.data];
        } else {
            const searchTerm = keyword.toLowerCase().trim();
            this.filteredData = this.data.filter(note => {
                const title = (note.title || '').toLowerCase();
                const author = (note.user_nickname || '').toLowerCase();
                return title.includes(searchTerm) || author.includes(searchTerm);
            });
        }
        this.renderStats();
        this.renderTable();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面已加载，开始初始化...');
    new XiaohongshuDashboard();
});