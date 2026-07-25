import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {motion} from 'framer-motion';
import {ArrowRight, BrainCircuit, CheckCircle2, Clock3, FileText, LogOut, Sparkles, Target, UploadCloud, Star, Moon, Sun, Bookmark} from 'lucide-react';
import './styles.css';

const api = axios.create({baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'});
api.interceptors.request.use(c => { const token = localStorage.getItem('access_token'); if (token) c.headers.Authorization = `Bearer ${token}`; return c; });
const useApi = (fn, initial) => { const [data, setData] = useState(initial); const [loading, setLoading] = useState(true); useEffect(()=>{fn().then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false))},[]); return {data,loading,setData} };
const logo = <Link className="brand" to="/"><span><BrainCircuit size={19}/></span>InterviewOS</Link>;

function Layout({children}) {
  const nav = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <header>
        {logo}
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/resume">Resume</Link>
          <Link to="/plan">Plan</Link>
          <Link to="/match">Job match</Link>
          <Link to="/saved">Saved questions</Link>
          <Link to="/history">History</Link>
          <button className="theme-toggle-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="quiet" onClick={() => { localStorage.clear(); nav('/login'); }}><LogOut size={16}/> Sign out</button>
        </nav>
      </header>
      <main className="app-shell">{children}</main>
    </>
  );
}

function Landing(){return <div className="landing"><header>{logo}<nav><Link to="/login">Sign in</Link><Link className="button" to="/register">Start practising <ArrowRight size={16}/></Link></nav></header><section className="hero"><motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}><p className="eyebrow"><Sparkles size={15}/> AI-powered interview practice</p><h1>Turn every interview into your <em>advantage.</em></h1><p className="lede">Personalized mock interviews, instant feedback and a clear path to interview confidence.</p><div className="actions"><Link className="button big" to="/register">Build your edge <ArrowRight size={18}/></Link><a className="text-link" href="#how">See how it works</a></div><div className="trust"><span>Built for focused candidates</span><span>Technical · Behavioral · System design</span></div></motion.div><div className="hero-card"><div className="card-top"><span className="pulse"></span> Live feedback <span>02:34</span></div><p className="question">“How did you balance speed and reliability on your last project?”</p><div className="feedback"><strong>82</strong><div><b>Strong answer</b><small>Clear structure · Add a measurable outcome</small></div></div><div className="bars"><i></i><i></i><i></i><i></i></div></div></section><section id="how" className="feature-grid"><article><FileText/><h3>Know your story</h3><p>Upload your resume for an ATS-focused review and targeted practice plan.</p></article><article><Target/><h3>Practice what matters</h3><p>Generate role-specific questions at the difficulty that stretches you.</p></article><article><BrainCircuit/><h3>Improve with clarity</h3><p>Get structured feedback and model answers after every response.</p></article></section></div>}
function Auth({register=false}) {const nav=useNavigate(),[form,setForm]=useState({name:'',email:'',password:''}),[error,setError]=useState(''),[busy,setBusy]=useState(false); const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await api.post(`/api/auth/${register?'register':'login'}`,register?form:{email:form.email,password:form.password}); localStorage.setItem('access_token',r.data.access_token);nav('/dashboard')}catch(e){setError(e.response?.data?.detail||'Something went wrong')}finally{setBusy(false)}};return <div className="auth-page"><Link className="brand" to="/"><span><BrainCircuit size={19}/></span>InterviewOS</Link><form className="auth-card" onSubmit={submit}><p className="eyebrow">{register?'YOUR NEW PRACTICE SPACE':'WELCOME BACK'}</p><h2>{register?'Start preparing with intent.':'Continue your momentum.'}</h2>{register&&<label>Name<input required minLength="2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}<label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="8+ characters"/></label>{error&&<p className="error">{error}</p>}<button className="button full" disabled={busy}>{busy?'Please wait…':register?'Create account':'Sign in'} <ArrowRight size={16}/></button><p className="switch">{register ? <>Already a member? <Link to="/login">Sign in</Link></> : <>New to InterviewOS? <Link to="/register">Create an account</Link></>}</p></form></div>}
function Dashboard(){const {data,loading}=useApi(()=>api.get('/api/dashboard'),{});return <Layout><section className="page-head"><div><p className="eyebrow">YOUR PRACTICE HQ</p><h1>Keep building your edge.</h1><p>One intentional session at a time.</p></div><Link className="button" to="/setup">New interview <ArrowRight size={16}/></Link></section><section className="stats"><Stat label="Completed sessions" value={loading?'—':data.completed_interviews||0} icon={<CheckCircle2/>}/><Stat label="Average score" value={loading?'—':`${data.average_score||0}%`} icon={<Target/>}/><Stat label="Readiness" value={loading?'—':data.readiness||'Building momentum'} icon={<Sparkles/>}/></section><section className="split"><div className="panel"><div className="panel-title"><h2>Quick start</h2><span>Recommended</span></div><div className="practice"><div><BrainCircuit/><h3>Technical interview</h3><p>Practice concise explanations, trade-offs and problem solving.</p></div><Link className="text-link" to="/setup">Start now <ArrowRight size={15}/></Link></div></div><div className="panel"><div className="panel-title"><h2>Recent sessions</h2><Link to="/history">View all</Link></div>{data.recent?.length?data.recent.map(x=><div className="recent" key={x.id}><span>{x.role}</span><b>{x.score}%</b></div>):<div className="empty">Your completed sessions will appear here.</div>}</div></section></Layout>}
function Stat({label,value,icon}){return <article className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></article>}
function Resume(){const [file,setFile]=useState(),[result,setResult]=useState(),[error,setError]=useState(),[busy,setBusy]=useState(false);const upload=async()=>{if(!file)return;setBusy(true);setError('');try{let d=new FormData();d.append('file',file);const r=await api.post('/api/resumes',d);setResult(r.data)}catch(e){setError(e.response?.data?.detail||'Upload failed')}finally{setBusy(false)}};return <Layout><section className="page-head"><div><p className="eyebrow">RESUME INTELLIGENCE</p><h1>Make your experience speak clearly.</h1><p>We scan your PDF for skills, signals and next steps.</p></div></section><div className="upload-zone"><UploadCloud size={32}/><h2>Upload your resume</h2><p>PDF only · Your file is analyzed securely.</p><input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])}/><button className="button" disabled={!file||busy} onClick={upload}>{busy?'Analyzing…':'Analyze resume'} <ArrowRight size={16}/></button>{error&&<p className="error">{error}</p>}</div>{result&&<div className="analysis"><div className="score"><strong>{result.analysis.ats_score}</strong><span>ATS score</span></div><div><h2>What we found</h2><p className="chips">{result.analysis.skills.length?result.analysis.skills.map(s=><i key={s}>{s}</i>):'No common skills detected yet.'}</p><h3>Next improvements</h3>{result.analysis.gaps.map(g=><p className="tip" key={g}>✦ {g}</p>)}</div></div>}</Layout>}

function Setup(){
  const nav = useNavigate();
  const [mode, setMode] = useState('ai'); // 'ai' or 'custom'
  const [form, setForm] = useState({ role: 'Software Engineer', interview_type: 'Technical', difficulty: 'Intermediate', question_count: 5 });
  const [customText, setCustomText] = useState('');
  const [busy, setBusy] = useState(false);

  const presets = [
    "How do you optimize slow database queries in Django or PostgreSQL?",
    "Tell me about a time you resolved a conflict with a senior engineer.",
    "Design a real-time notification service for 10M concurrent users.",
    "Walk me through a difficult bug you fixed under tight deadlines."
  ];

  const appendPreset = (qText) => {
    setCustomText(prev => prev ? `${prev.trim()}\n${qText}` : qText);
  };

  const create = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (mode === 'custom') {
        const lines = customText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) payload.custom_questions = lines;
      }
      const r = await api.post('/api/interviews', payload);
      nav(`/interview/${r.data.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <section className="page-head">
        <div>
          <p className="eyebrow">CONFIGURE SESSION</p>
          <h1>Set the challenge.</h1>
          <p>Generate role-tailored questions or enter your own custom questions from recruiters or Glassdoor.</p>
        </div>
      </section>

      <div style={{display:'flex', gap:'12px', marginBottom:'20px', maxWidth:'680px'}}>
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'ai' ? 'button active' : 'quiet'}`}
          style={{flex:1, justifyContent:'center', padding:'12px'}}
          onClick={() => setMode('ai')}
        >
          <Sparkles size={16}/> AI Question Generator
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'custom' ? 'button active' : 'quiet'}`}
          style={{flex:1, justifyContent:'center', padding:'12px'}}
          onClick={() => setMode('custom')}
        >
          <FileText size={16}/> Custom Questions Input
        </button>
      </div>

      <form className="setup panel" onSubmit={create}>
        <label>Target role<input value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/></label>
        <label>Interview type<select value={form.interview_type} onChange={e=>setForm({...form,interview_type:e.target.value})}>{['Technical','Behavioral','System Design','Mixed'].map(x=><option key={x}>{x}</option>)}</select></label>
        
        {mode === 'ai' ? (
          <>
            <label>Difficulty<select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}>{['Entry','Intermediate','Advanced'].map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Questions<select value={form.question_count} onChange={e=>setForm({...form,question_count:+e.target.value})}>{[3,5,8,10].map(x=><option key={x} value={x}>{x} questions</option>)}</select></label>
          </>
        ) : (
          <div className="full">
            <label>
              Custom Questions (Type or paste questions sent by recruiters or Glassdoor)
              <textarea
                required
                rows={5}
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g.&#10;How do you optimize slow database queries in PostgreSQL?&#10;Tell me about a time you resolved a technical disagreement."
                style={{marginTop:'8px', minHeight:'120px'}}
              />
            </label>
            <div style={{marginTop:'10px'}}>
              <span style={{fontSize:'12px', color:'#64748b'}}>Quick Presets (Click to add):</span>
              <div className="preset-chips">
                {presets.map((p, idx) => (
                  <button type="button" key={idx} className="preset-chip" onClick={() => appendPreset(p)}>
                    + {p.length > 38 ? p.substring(0, 38) + '...' : p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button className="button full" disabled={busy}>{busy ? 'Creating session…' : 'Begin session'} <ArrowRight size={16}/></button>
      </form>
    </Layout>
  );
}

function InterviewPage(){
  const {id} = useParams();
  const nav = useNavigate();
  const {data:interview, loading, setData} = useApi(() => api.get(`/api/interviews/${id}`), null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  if (loading) return <Layout><div className="empty">Loading your session…</div></Layout>;
  if (!interview) return <Navigate to="/dashboard"/>;
  const q = interview.questions[index];

  const save = async () => {
    const r = await api.put(`/api/questions/${q.id}/answer`, { answer_text: answer });
    setData({ ...interview, questions: interview.questions.map(x => x.id === q.id ? { ...x, answer_text: answer, ...r.data } : x) });
    setSaved(true);
  };

  const toggleBookmark = async (qId) => {
    const r = await api.patch(`/api/questions/${qId}/bookmark`);
    setData({
      ...interview,
      questions: interview.questions.map(x => x.id === qId ? { ...x, is_bookmarked: r.data.is_bookmarked } : x)
    });
  };

  const finish = async () => {
    await api.post(`/api/interviews/${id}/complete`);
    nav('/history');
  };

  return (
    <Layout>
      <div className="interview-head">
        <span><Clock3 size={16}/> Focus session</span>
        <span>{index + 1} / {interview.questions.length}</span>
      </div>
      <div className="progress"><i style={{width: `${(index + 1) / interview.questions.length * 100}%`}}/></div>
      
      <section className="question-panel">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <p className="eyebrow">{q.category}</p>
          <button className="quiet" onClick={() => toggleBookmark(q.id)} style={{color: q.is_bookmarked ? '#e3a008' : 'inherit', fontWeight: 600}}>
            <Star size={16} fill={q.is_bookmarked ? '#e3a008' : 'none'} color={q.is_bookmarked ? '#e3a008' : 'currentColor'}/> {q.is_bookmarked ? 'Starred' : 'Bookmark question'}
          </button>
        </div>
        
        <h1>{q.prompt}</h1>
        <textarea value={answer} onChange={e => { setAnswer(e.target.value); setSaved(false); }} placeholder="Take a breath, then explain your thinking…"/>
        
        <div className="answer-foot">
          <span>{answer.length} characters {saved && '· Saved with feedback'}</span>
          <button className="button" onClick={save} disabled={!answer}>Get feedback <ArrowRight size={16}/></button>
        </div>
        
        {q.feedback && (
          <div className="answer-feedback">
            <strong>{q.score}/100</strong>
            <div>
              <b>{q.feedback.strengths[0]}</b>
              <p>{q.feedback.improvements[0]}</p>
            </div>
          </div>
        )}
      </section>
      
      <div className="nav-row">
        <button className="quiet" disabled={!index} onClick={() => { setIndex(index - 1); setAnswer(interview.questions[index - 1].answer_text || ''); }}>Previous</button>
        {index < interview.questions.length - 1 ? (
          <button className="quiet" onClick={() => { setIndex(index + 1); setAnswer(interview.questions[index + 1].answer_text || ''); }}>Next question</button>
        ) : (
          <button className="button" onClick={finish}>Complete interview <CheckCircle2 size={16}/></button>
        )}
      </div>
    </Layout>
  );
}

function SavedQuestions() {
  const { data: questions, loading, setData } = useApi(() => api.get('/api/questions/bookmarked'), []);
  const [filter, setFilter] = useState('');

  const toggleBookmark = async (qId) => {
    await api.patch(`/api/questions/${qId}/bookmark`);
    setData(questions.filter(q => q.id !== qId));
  };

  const filtered = questions.filter(q => 
    q.prompt.toLowerCase().includes(filter.toLowerCase()) || 
    q.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout>
      <section className="page-head">
        <div>
          <p className="eyebrow"><Bookmark size={15}/> YOUR SAVED BANK</p>
          <h1>Bookmarked Questions.</h1>
          <p>Review tough questions and AI feedback you've saved for pre-interview revision.</p>
        </div>
      </section>

      {questions.length > 0 && (
        <div style={{marginBottom:'20px', maxWidth:'450px'}}>
          <input 
            type="text" 
            placeholder="Search saved questions by keyword or category..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      )}

      <div style={{display:'grid', gap:'16px'}}>
        {loading ? (
          <div className="panel empty">Loading saved questions…</div>
        ) : filtered.length ? (
          filtered.map(q => (
            <article key={q.id} className="saved-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <span className="eyebrow">{q.category}</span>
                <button className="quiet" onClick={() => toggleBookmark(q.id)} style={{color:'#e3a008', fontWeight:600}}>
                  <Star size={16} fill="#e3a008" color="#e3a008"/> Remove
                </button>
              </div>
              <h3 style={{fontSize:'18px', margin:'10px 0 12px'}}>{q.prompt}</h3>
              {q.answer_text && (
                <div className="user-answer-box">
                  <strong>Your Answer:</strong> {q.answer_text}
                </div>
              )}
              {q.feedback && (
                <div className="answer-feedback" style={{marginTop:'8px', padding:'14px'}}>
                  <strong style={{fontSize:'22px'}}>{q.score}/100</strong>
                  <div>
                    <b>{q.feedback.strengths[0]}</b>
                    <p style={{margin:0}}>{q.feedback.improvements[0]}</p>
                  </div>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="panel empty">
            {filter ? 'No saved questions matched your search.' : 'No bookmarked questions yet. Click "Bookmark question" during any mock session to save it here!'}
          </div>
        )}
      </div>
    </Layout>
  );
}


function History(){const {data,loading}=useApi(()=>api.get('/api/interviews'),[]);return <Layout><section className="page-head"><div><p className="eyebrow">YOUR LIBRARY</p><h1>Every session is evidence.</h1><p>Revisit feedback and measure the progress you’ve earned.</p></div><Link className="button" to="/setup">New session <ArrowRight size={16}/></Link></section><div className="panel history">{loading?<div className="empty">Loading…</div>:data.length?data.map(x=><div className="history-row" key={x.id}><div><b>{x.role}</b><span>{x.interview_type} · {x.difficulty}</span></div><div><strong>{x.overall_score ?? '—'}{x.overall_score!==null&&'%'}</strong><small>{x.status.replace('_',' ')}</small></div><Link className="text-link" to={`/interview/${x.id}`}>{x.status==='completed'?'Review':'Continue'} <ArrowRight size={14}/></Link></div>):<div className="empty">No sessions yet. Your next answer could be your best one.</div>}</div></Layout>}
function Plan(){const today=new Date();const future=new Date(today);future.setDate(today.getDate()+14);const [plan,setPlan]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[form,setForm]=useState({role:'Backend Developer',experience_level:'Intermediate',interview_date:future.toISOString().slice(0,10),duration_weeks:2,job_description:''});useEffect(()=>{api.get('/api/preparation/plan').then(r=>setPlan(r.data)).catch(()=>{})},[]);const create=async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await api.post('/api/preparation/plan',form);setPlan(r.data)}catch(err){setError(err.response?.data?.detail||'Could not create your plan')}finally{setBusy(false)}};const toggle=async task=>{const r=await api.patch(`/api/preparation/plan/${plan.id}/tasks/${task.day}`,{completed:!task.completed});setPlan(r.data)};return <Layout><section className="page-head"><div><p className="eyebrow">ADAPTIVE PREPARATION</p><h1>Your interview plan.</h1><p>A daily roadmap that adjusts around completed interviews and feedback.</p></div></section>{!plan?<form className="plan-form panel" onSubmit={create}><label>Target role<input value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/></label><label>Experience<select value={form.experience_level} onChange={e=>setForm({...form,experience_level:e.target.value})}>{['Entry','Intermediate','Senior'].map(x=><option key={x}>{x}</option>)}</select></label><label>Interview date<input type="date" required value={form.interview_date} onChange={e=>setForm({...form,interview_date:e.target.value})}/></label><label>Plan duration<select value={form.duration_weeks} onChange={e=>setForm({...form,duration_weeks:+e.target.value})}>{[1,2,3,4].map(x=><option key={x} value={x}>{x} week{x>1?'s':''}</option>)}</select></label><label className="wide">Job description (optional)<textarea value={form.job_description} onChange={e=>setForm({...form,job_description:e.target.value})} placeholder="Paste key responsibilities or requirements to make the plan more specific…"/></label>{error&&<p className="error wide">{error}</p>}<button className="button wide" disabled={busy}>{busy?'Creating…':'Create personalized plan'} <ArrowRight size={16}/></button></form>:<><section className="plan-summary"><article><span>Countdown</span><strong>{plan.days_remaining} days</strong><small>until your interview</small></article><article><span>Progress</span><strong>{plan.progress}%</strong><small>{plan.completed_tasks}/{plan.total_tasks} tasks completed</small></article><article><span>Focus signals</span><strong>{plan.weaknesses?.[0]?.replace('_',' ')}</strong><small>updated from feedback</small></article><button className="quiet" onClick={()=>setPlan(null)}>Regenerate plan</button></section><section className="plan-grid">{plan.tasks.map(task=><article className={`day-card ${task.completed?'done':''}`} key={task.day}><div><b>Day {task.day}</b><span>{task.minutes} min</span></div><h3>{task.focus}</h3><p>{task.task}</p><label className="check"><input type="checkbox" checked={task.completed} onChange={()=>toggle(task)}/> Complete</label></article>)}</section></>}</Layout>}
function JobMatch(){
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sampleJD = "We are seeking a Senior Fullstack Engineer proficient in Python, FastAPI, React, PostgreSQL, Docker, AWS, and RESTful APIs. Responsibilities include building scalable web applications, optimizing database performance, designing microservices, writing automated unit tests, and collaborating with product teams in an Agile environment.";

  const run = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.post('/api/job-match', { job_description: description });
      setResult(r.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload a resume under the Resume section before generating a match report.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <section className="page-head">
        <div>
          <p className="eyebrow"><Sparkles size={15}/> ATS RESUME MATCH ENGINE</p>
          <h1>Tailor your resume for target roles.</h1>
          <p>Instantly compare your resume against any job description to discover skill gaps, ATS keywords, and tailored STAR bullet recommendations.</p>
        </div>
      </section>

      <form className="panel match-form" onSubmit={run}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
          <label style={{margin:0}}>Target Job Description</label>
          <button type="button" className="quiet" style={{fontSize:'12px', color:'#1565d8'}} onClick={() => setDescription(sampleJD)}>
            <Sparkles size={13}/> Try sample job description
          </button>
        </div>
        <textarea
          required
          minLength="40"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Paste the target job description (responsibilities, requirements, technical stack)..."
        />
        {error && <p className="error" style={{marginTop:'12px'}}>{error}</p>}
        <button className="button" style={{marginTop:'16px'}} disabled={busy}>
          {busy ? 'Analyzing Match...' : 'Generate Match Analysis'} <ArrowRight size={16}/>
        </button>
      </form>

      {result && (
        <section className="match-analysis-wrapper" style={{marginTop:'28px'}}>
          {/* Header Score Banner */}
          <div className="panel match-header-banner" style={{display:'flex', gap:'30px', alignItems:'center', background:'linear-gradient(135deg, #1675e0, #0a4aa5)', color:'#fff', padding:'28px', borderRadius:'18px'}}>
            <div className="match-circle" style={{minWidth:'110px', height:'110px', borderRadius:'50%', background:'rgba(255,255,255,0.18)', border:'4px solid #fff', display:'grid', placeItems:'center', textAlign:'center'}}>
              <div>
                <strong style={{fontSize:'36px', lineHeight:1, display:'block'}}>{result.match_score}%</strong>
                <span style={{fontSize:'11px', opacity:0.9}}>MATCH</span>
              </div>
            </div>
            <div>
              <span style={{fontSize:'12px', letterSpacing:'0.08em', textTransform:'uppercase', background:'rgba(255,255,255,0.2)', padding:'4px 10px', borderRadius:'12px', fontWeight:600}}>{result.match_level}</span>
              <h2 style={{fontSize:'26px', margin:'10px 0 6px', color:'#fff'}}>Resume Alignment Summary</h2>
              <p style={{margin:0, opacity:0.9, fontSize:'14px'}}>{result.rewrite_guidance}</p>
            </div>
          </div>

          {/* Grid Breakdown */}
          <div className="match-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px'}}>
            {/* Matched Skills */}
            <article className="panel">
              <h3 style={{color:'#1565d8', display:'flex', alignItems:'center', gap:'8px', marginTop:0}}>
                <CheckCircle2 size={18}/> Matched Technical Skills ({result.strong_match?.length || 0})
              </h3>
              <div className="chips" style={{marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'6px'}}>
                {result.strong_match?.length ? result.strong_match.map(s => (
                  <i key={s} style={{background:'#e6f4ea', color:'#137333', padding:'6px 12px', borderRadius:'16px', fontSize:'13px', fontWeight:600}}>{s}</i>
                )) : <span style={{color:'#6480a4', fontSize:'13px'}}>No exact technical skills overlapped yet.</span>}
              </div>
            </article>

            {/* Missing Skills & ATS Keywords */}
            <article className="panel">
              <h3 style={{color:'#c8303f', display:'flex', alignItems:'center', gap:'8px', marginTop:0}}>
                <Target size={18}/> Missing Skills & Priority ATS Keywords
              </h3>
              <div className="chips" style={{marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'6px'}}>
                {result.ats_keywords?.length ? result.ats_keywords.map(k => (
                  <i key={k} style={{background:'#fce8e6', color:'#c5221f', padding:'6px 12px', borderRadius:'16px', fontSize:'13px', fontWeight:600}}>+ {k}</i>
                )) : <span style={{color:'#6480a4', fontSize:'13px'}}>All core job keywords present!</span>}
              </div>
            </article>

            {/* Responsibilities Match */}
            <article className="panel">
              <h3 style={{color:'#123466', marginTop:0}}>Responsibility & Role Expectations</h3>
              <div style={{marginTop:'12px'}}>
                <h4 style={{fontSize:'13px', color:'#527198', margin:'8px 0 6px'}}>Demonstrated Responsibilities</h4>
                {result.matched_responsibilities?.length ? result.matched_responsibilities.map(r => (
                  <p key={r} style={{fontSize:'13px', color:'#102a56', margin:'4px 0'}}>✓ {r}</p>
                )) : <p style={{fontSize:'13px', color:'#6480a4'}}>Add explicit action verbs to your resume bullets.</p>}

                {result.missing_responsibilities?.length > 0 && (
                  <>
                    <h4 style={{fontSize:'13px', color:'#c8303f', margin:'14px 0 6px'}}>Responsibilities to Emphasize</h4>
                    {result.missing_responsibilities.map(r => (
                      <p key={r} style={{fontSize:'13px', color:'#5b7395', margin:'4px 0'}}>• {r}</p>
                    ))}
                  </>
                )}
              </div>
            </article>

            {/* Action Plan */}
            <article className="panel">
              <h3 style={{color:'#123466', marginTop:0}}>Next Steps to Boost Match</h3>
              <div style={{marginTop:'12px'}}>
                {result.action_plan?.map((step, idx) => (
                  <div key={idx} style={{display:'flex', gap:'10px', marginBottom:'10px', fontSize:'13px', color:'#5b7395'}}>
                    <strong style={{color:'#1565d8', minWidth:'20px'}}>{idx + 1}.</strong>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Tailored STAR Bullet Point Suggestions */}
          <article className="panel" style={{marginTop:'20px', background:'linear-gradient(135deg, #f7faff, #ffffff)', border:'1px solid #c9dcf3'}}>
            <h3 style={{color:'#123466', display:'flex', alignItems:'center', gap:'8px', marginTop:0}}>
              <BrainCircuit size={19}/> Tailored STAR Bullet Recommendations
            </h3>
            <p style={{color:'#527198', fontSize:'13px', marginBottom:'16px'}}>
              Use these customized bullet points as templates for your resume experience section to align directly with this job description:
            </p>
            <div style={{display:'grid', gap:'12px'}}>
              {result.star_bullet_suggestions?.map((bullet, idx) => (
                <div key={idx} style={{background:'#ffffff', border:'1px solid #d8e7f8', borderRadius:'10px', padding:'14px', fontSize:'14px', color:'#102a56', lineHeight:1.55}}>
                  <strong style={{color:'#1565d8', marginRight:'8px'}}>Bullet {idx+1}:</strong> "{bullet}"
                </div>
              ))}
            </div>
            <p style={{fontSize:'12px', color:'#6480a4', marginTop:'14px'}}>
              💡 <em>{result.detail_prompt}</em>
            </p>
          </article>
        </section>
      )}
    </Layout>
  );
}

function App(){return <Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<Auth/>}/><Route path="/register" element={<Auth register/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/resume" element={<Resume/>}/><Route path="/plan" element={<Plan/>}/><Route path="/match" element={<JobMatch/>}/><Route path="/saved" element={<SavedQuestions/>}/><Route path="/setup" element={<Setup/>}/><Route path="/interview/:id" element={<InterviewPage/>}/><Route path="/history" element={<History/>}/><Route path="*" element={<Landing/>}/></Routes>};createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
