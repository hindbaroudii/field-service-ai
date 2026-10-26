
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  Settings,
  Layers3,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Layers3 size={22} />
        </div>
        <span>
          Field Service <strong>AI</strong>
        </span>
      </div>

      <div className="nav-label">WORKSPACE</div>

      <nav className="navigation">
        <div className="nav-item">
          <LayoutDashboard size={19} />
          Dashboard
        </div>

        <div className="nav-item active">
          <FilePlus2 size={19} />
          Nieuwe werkbon
        </div>

        <div className="nav-item">
          <Files size={19} />
          Werkbonnen
        </div>

        <div className="nav-item">
          <Settings size={19} />
          Instellingen
        </div>
      </nav>

      <div className="sidebar-bottom">
        <div className="avatar">FS</div>
        <div>
          <strong>Field Service AI</strong>
          <span>Workspace</span>
        </div>
      </div>
    </aside>
  );
}
