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
            const response = await fetch('xiaohongshu_data.json');
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const result = await response.json();
            
            if (result.success && result.data) {
                this.data = result.data.items;
                this.filteredData = [...this.data];
                
                document.getElementById('notesTable').innerHTML = '';
                this.renderTable();
            } else {
                throw new Error('数据格式错误');
            }
        } catch (error) {
            console.error('数据加载失败:', error);
            document.getElementById('notesTable').innerHTML = 
                '<div class="error">❌ 数据加载失败，请检查JSON文件路径</div>';
        }
    }
    
    renderStats() {
        const totalNotes = this.filteredData.length;
        const totalLikes = this.filteredData.reduce((sum, note) => sum + (note.likes || 0), 0);
        const avgLikes = totalNotes > 0 ? Math.round(totalLikes / totalNotes) : 0;
        const videoNotes = this.filteredData.filter(note => note.note_type === '视频').length;
        const videoRatio = totalNotes > 0 ? Math.round((videoNotes / totalNotes) * 100) : 0;
        
        document.getElementById('totalNotes').textContent = totalNotes;
        document.getElementById('avgLikes').textContent = avgLikes;
        document.getElementById('videoRatio').textContent = `${videoRatio}%`;
    }
    
    renderTable() {
        const notesTable = document.getElementById('notesTable');
        let html = '<div class="note-item note-header">';
        html += '<div>标题</div><div>作者</div><div>点赞数</div><div>评论数</div><div>类型</div>';
        html += '</div>';
        
        this.filteredData.forEach(note => {
            html += `
                <div class="note-item">
                    <div title="${note.title}">${this.truncateText(note.title, 50)}</div>
                    <div>${note.user_nickname}</div>
                    <div>${note.likes || 0}</div>
                    <div>${note.comments || 0}</div>
                    <div>
                        <span class="${note.note_type === '视频' ? 'video-badge' : 'text-badge'}">
                            ${note.note_type}
                        </span>
                    </div>
                </div>
            `;
        });
        
        notesTable.innerHTML = html;
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    bindEvents() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchNotes(e.target.value);
        });
    }
    
    searchNotes(keyword) {
        if (!keyword.trim()) {
            this.filteredData = [...this.data];
        } else {
            const searchTerm = keyword.toLowerCase();
            this.filteredData = this.data.filter(note => 
                note.title.toLowerCase().includes(searchTerm) ||
                note.user_nickname.toLowerCase().includes(searchTerm)
            );
        }
        this.renderStats();
        this.renderTable();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new XiaohongshuDashboard();
});