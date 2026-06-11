import { Link } from 'react-router-dom';

function Header({ onAdd, onSettings, onAddProject }) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-800">多智能体提案管理</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900">提案</Link>
            <Link to="/agents" className="text-gray-600 hover:text-gray-900">智能体</Link>
          </nav>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onAddProject}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <span>+</span> 新建项目
          </button>
          <button
            onClick={onAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <span>+</span> 添加提案
          </button>
          <button
            onClick={onSettings}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            设置
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
