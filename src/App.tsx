import * as React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trophy, 
  Menu,
  X,
  Trash2,
  Play,
  Lightbulb,
  Info,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Tutorial, Difficulty, Category, TaskStatus, UserStats } from './types';
import { generateTutorial, suggestTasks } from './services/gemini';

// --- Utility Components ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-secondary/20 text-accent',
    warning: 'bg-orange-100 text-orange-700',
    info: 'bg-primary/10 text-primary'
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${variants[variant]}`}>{children}</span>;
};

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'tasks' | 'tutorials' | 'agenda'>('dashboard');
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [stats, setStats] = React.useState<UserStats>({ tasksCompleted: 0, points: 3383000, level: 6767 });
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [selectedTutorial, setSelectedTutorial] = React.useState<Tutorial | null>(null);
  const [isLoadingTutorial, setIsLoadingTutorial] = React.useState(false);

  // Load data
  React.useEffect(() => {
    const savedTasks = localStorage.getItem('ht_tasks');
    const savedStats = localStorage.getItem('ht_stats');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  // Save data
  React.useEffect(() => {
    localStorage.setItem('ht_tasks', JSON.stringify(tasks));
    localStorage.setItem('ht_stats', JSON.stringify(stats));
  }, [tasks, stats]);

  const addTask = (title: string, category: Category, difficulty: Difficulty, dueDate: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description: '',
      category,
      difficulty,
      estimatedTime: '30 min',
      status: 'Pendente',
      dueDate,
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
    setIsAddingTask(false);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus: TaskStatus = t.status === 'Concluída' ? 'Pendente' : 'Concluída';
        if (newStatus === 'Concluída') {
          setStats(s => ({
            ...s,
            tasksCompleted: s.tasksCompleted + 1,
            points: s.points + 50,
            level: Math.floor((s.points + 50) / 500) + 1
          }));
        } else {
          setStats(s => ({
            ...s,
            tasksCompleted: s.tasksCompleted - 1,
            points: Math.max(0, s.points - 50),
            level: Math.floor(Math.max(0, s.points - 50) / 500) + 1
          }));
        }
        return { ...t, status: newStatus, completedAt: newStatus === 'Concluída' ? new Date().toISOString() : undefined };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleLearn = async (title: string, difficulty: Difficulty) => {
    setIsLoadingTutorial(true);
    setActiveTab('tutorials');
    try {
      const tutorial = await generateTutorial(title, difficulty);
      setSelectedTutorial(tutorial);
    } catch (error) {
      console.error("Erro ao gerar tutorial:", error);
    } finally {
      setIsLoadingTutorial(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-[#1E293B] font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-accent">HOME TASK HELP</h1>
          <p className="text-xs text-gray-500 font-medium">Seu assistente doméstico inteligente</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-primary uppercase">Nível {stats.level}</p>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(stats.points % 500) / 5}%` }}
              />
            </div>
          </div>
          <div className="bg-primary/10 p-2 rounded-xl">
            <Trophy size={20} className="text-primary" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Greeting */}
              <section>
                <h2 className="text-2xl font-bold text-accent">Olá, Gabriel! 👋</h2>
                <p className="text-gray-500 mt-1">Você tem {tasks.filter(t => t.status !== 'Concluída').length} tarefas pendentes para hoje.</p>
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-linear-to-br from-primary to-accent text-white border-none shadow-lg shadow-primary/20">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Pontos</p>
                  <p className="text-3xl font-bold mt-1">{stats.points}</p>
                </Card>
                <Card className="bg-secondary/10 border-secondary/20">
                  <p className="text-secondary-foreground/60 text-xs font-semibold uppercase tracking-wider">Concluídas</p>
                  <p className="text-3xl font-bold mt-1 text-accent">{stats.tasksCompleted}</p>
                </Card>
              </div>

              {/* Quick Actions */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Ações Rápidas</h3>
                  <button 
                    onClick={async () => {
                      const suggestions = await suggestTasks(tasks.map(t => t.title));
                      if (suggestions.length > 0) {
                        const first = suggestions[0];
                        addTask(first.title, first.category, first.difficulty, new Date().toISOString());
                      }
                    }}
                    className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <Lightbulb size={12} /> Sugerir Tarefa
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsAddingTask(true)}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-colors group"
                  >
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Plus className="text-primary" size={24} />
                    </div>
                    <span className="mt-3 font-semibold text-sm">Nova Tarefa</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('tutorials')}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-secondary/20 transition-colors group"
                  >
                    <div className="bg-secondary/10 p-3 rounded-xl group-hover:bg-secondary/20 transition-colors">
                      <BookOpen className="text-secondary" size={24} />
                    </div>
                    <span className="mt-3 font-semibold text-sm">Tutoriais</span>
                  </button>
                </div>
              </section>

              {/* Recent Tasks */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Próximas Tarefas</h3>
                  <button onClick={() => setActiveTab('tasks')} className="text-primary text-sm font-semibold">Ver todas</button>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => t.status !== 'Concluída').slice(0, 3).map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} onLearn={handleLearn} />
                  ))}
                  {tasks.filter(t => t.status !== 'Concluída').length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <CheckCircle2 className="mx-auto text-gray-300 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">Tudo limpo por aqui!</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Minhas Tarefas</h2>
                <button 
                  onClick={() => setIsAddingTask(true)}
                  className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {['Pendentes', 'Em andamento', 'Concluída'].map((status) => (
                    <button 
                      key={status}
                      className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-gray-100 text-sm font-semibold shadow-sm"
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={deleteTask} onLearn={handleLearn} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-gray-400">Nenhuma tarefa cadastrada.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tutorials' && (
            <motion.div
              key="tutorials"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {!selectedTutorial ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Aprender</h2>
                    <p className="text-gray-500 text-sm">Tutoriais inteligentes gerados por IA para qualquer tarefa.</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="O que você quer aprender hoje?"
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleLearn(e.currentTarget.value, 'Iniciante');
                      }}
                    />
                  </div>

                  {isLoadingTutorial && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                      <p className="text-gray-500 font-medium animate-pulse">Gerando tutorial inteligente...</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <h3 className="font-bold mt-4">Categorias</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Limpeza', 'Cozinha', 'Organização', 'Reparos'].map(cat => (
                        <button key={cat} className="p-4 bg-white rounded-2xl border border-gray-100 text-left hover:border-primary/20 transition-colors">
                          <p className="font-bold">{cat}</p>
                          <p className="text-xs text-gray-400 mt-1">12 tutoriais</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <TutorialDetail tutorial={selectedTutorial} onBack={() => setSelectedTutorial(null)} />
              )}
            </motion.div>
          )}

          {activeTab === 'agenda' && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Agenda</h2>
              <Card className="p-0 overflow-hidden">
                <div className="bg-primary p-6 text-white text-center">
                  <p className="text-white/70 text-sm font-semibold uppercase tracking-widest">Março 2026</p>
                  <p className="text-4xl font-bold mt-1">26</p>
                  <p className="text-white/70 mt-1">Quinta-feira</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">Tarefas do Dia</h3>
                    <Badge variant="info">{tasks.filter(t => t.dueDate.startsWith('2026-03-26')).length} tarefas</Badge>
                  </div>
                  <div className="space-y-4">
                    {tasks.filter(t => t.dueDate.startsWith('2026-03-26')).map(task => (
                      <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${task.status === 'Concluída' ? 'bg-primary' : 'bg-orange-400'}`} />
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${task.status === 'Concluída' ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{task.category}</p>
                        </div>
                        <Clock size={14} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-40">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} label="Início" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={24} />} label="Tarefas" />
          <NavButton active={activeTab === 'tutorials'} onClick={() => setActiveTab('tutorials')} icon={<BookOpen size={24} />} label="Aprender" />
          <NavButton active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} icon={<CalendarIcon size={24} />} label="Agenda" />
        </div>
      </nav>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTask(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Nova Tarefa</h3>
                <button onClick={() => setIsAddingTask(false)} className="bg-gray-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <AddTaskForm onAdd={addTask} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-gray-400'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
    </button>
  );
}

function TaskItem({ task, onToggle, onDelete, onLearn }: { task: Task, onToggle: (id: string) => void, onDelete?: (id: string) => void, onLearn: (title: string, diff: Difficulty) => Promise<void> | void }) {
  return (
    <Card className="flex items-center gap-4 group">
      <button 
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          task.status === 'Concluída' ? 'bg-primary border-primary' : 'border-gray-200 hover:border-primary/40'
        }`}
      >
        {task.status === 'Concluída' && <CheckSquare size={14} className="text-white" />}
      </button>
      <div className="flex-1">
        <h4 className={`font-bold text-sm ${task.status === 'Concluída' ? 'line-through text-gray-400' : 'text-accent'}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={task.difficulty === 'Iniciante' ? 'success' : task.difficulty === 'Intermediário' ? 'warning' : 'info'}>
            {task.difficulty}
          </Badge>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter flex items-center gap-1">
            <Clock size={10} /> {task.estimatedTime}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onLearn(task.title, task.difficulty)}
          className="p-2 text-primary hover:bg-primary/10 rounded-lg"
          title="Ver tutorial"
        >
          <BookOpen size={18} />
        </button>
        {onDelete && (
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </Card>
  );
}

function AddTaskForm({ onAdd }: { onAdd: (title: string, category: Category, difficulty: Difficulty, dueDate: string) => void }) {
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState<Category>('Limpeza');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('Iniciante');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, category, difficulty, new Date().toISOString());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome da Tarefa</label>
        <input 
          autoFocus
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: Limpar janelas da sala"
          className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-semibold"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-semibold appearance-none"
          >
            <option value="Limpeza">Limpeza</option>
            <option value="Cozinha">Cozinha</option>
            <option value="Organização">Organização</option>
            <option value="Reparos">Reparos</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dificuldade</label>
          <select 
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-semibold appearance-none"
          >
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-accent transition-colors"
      >
        Criar Tarefa
      </button>
    </form>
  );
}

function TutorialDetail({ tutorial, onBack }: { tutorial: Tutorial, onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-sm">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="info">{tutorial.difficulty}</Badge>
          <Badge variant="default">{tutorial.estimatedTime}</Badge>
        </div>
        <h2 className="text-3xl font-bold text-accent">{tutorial.title}</h2>
        <p className="text-gray-600 leading-relaxed">{tutorial.overview}</p>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <div className="bg-secondary/20 p-1.5 rounded-lg"><AlertTriangle size={18} className="text-primary" /></div>
          Materiais Necessários
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tutorial.materials.map((m, i) => (
            <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 text-sm font-medium">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full" /> {m}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg"><Play size={18} className="text-primary" /></div>
          Passo a Passo
        </h3>
        <div className="space-y-4">
          {tutorial.steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1">
                <p className="text-sm leading-relaxed">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <h4 className="font-bold text-primary flex items-center gap-2 mb-3">
            <Info size={18} /> O Porquê
          </h4>
          <p className="text-sm text-primary/80 leading-relaxed">{tutorial.explanation}</p>
        </Card>
        <Card className="bg-secondary/10 border-secondary/20">
          <h4 className="font-bold text-secondary-foreground flex items-center gap-2 mb-3">
            <Lightbulb size={18} /> Dicas de Mestre
          </h4>
          <ul className="space-y-2">
            {tutorial.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span>✨</span> {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section className="space-y-4">
        <h4 className="font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle size={18} /> Erros Comuns a Evitar
        </h4>
        <div className="space-y-2">
          {tutorial.commonErrors.map((err, i) => (
            <div key={i} className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800 flex gap-3">
              <span>❌</span> {err}
            </div>
          ))}
        </div>
      </section>

      <Card className="bg-gray-900 text-white border-none p-8 text-center space-y-4">
        <h4 className="font-bold text-xl">Quer ver na prática?</h4>
        <p className="text-gray-400 text-sm">Recomendamos buscar no YouTube por:</p>
        <div className="bg-white/10 p-4 rounded-xl font-mono text-secondary break-all">
          {tutorial.videoSuggestion}
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
          Abrir YouTube
        </button>
      </Card>
    </motion.div>
  );
}
