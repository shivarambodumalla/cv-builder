export default function JobMatchVisual() {
  return (
    <svg width="536" height="616" viewBox="-8 -8 536 616" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="520" height="600" rx="16" fill="white" stroke="#E0D8CC" strokeWidth="1"/>

      <text x="24" y="36" fontFamily="Geist, system-ui" fontSize="13" fontWeight="600" fill="#0C1A0E">Job Match</text>
      <text x="24" y="52" fontFamily="Geist, system-ui" fontSize="10" fill="#9CA3AF">OpenAI · Senior ML Engineer</text>
      <rect x="400" y="22" width="96" height="24" rx="12" fill="#065F46"/>
      <text x="448" y="38" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="white" textAnchor="middle">88% match</text>

      <line x1="24" y1="68" x2="496" y2="68" stroke="#F0EDE6" strokeWidth="1"/>

      {/* Score ring */}
      <circle cx="260" cy="155" r="64" stroke="#E8F5F0" strokeWidth="10" fill="none"/>
      <circle cx="260" cy="155" r="64" stroke="#065F46" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="358 402" strokeDashoffset="100" transform="rotate(-90 260 155)"/>
      <text x="260" y="147" fontFamily="Geist, system-ui" fontSize="32" fontWeight="800" fill="#065F46" textAnchor="middle">88</text>
      <text x="260" y="166" fontFamily="Geist, system-ui" fontSize="11" fill="#6B7280" textAnchor="middle">Match Score</text>

      {/* Stat cards */}
      <rect x="24" y="238" width="144" height="48" rx="8" fill="#F0FDF4" stroke="#D1FAE5" strokeWidth="1"/>
      <text x="96" y="258" fontFamily="Geist, system-ui" fontSize="18" fontWeight="700" fill="#065F46" textAnchor="middle">14/16</text>
      <text x="96" y="276" fontFamily="Geist, system-ui" fontSize="10" fill="#6B7280" textAnchor="middle">Keywords matched</text>

      <rect x="188" y="238" width="144" height="48" rx="8" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1"/>
      <text x="260" y="258" fontFamily="Geist, system-ui" fontSize="18" fontWeight="700" fill="#DC2626" textAnchor="middle">2</text>
      <text x="260" y="276" fontFamily="Geist, system-ui" fontSize="10" fill="#6B7280" textAnchor="middle">Skills missing</text>

      <rect x="352" y="238" width="144" height="48" rx="8" fill="#F0FDF4" stroke="#D1FAE5" strokeWidth="1"/>
      <text x="424" y="258" fontFamily="Geist, system-ui" fontSize="18" fontWeight="700" fill="#065F46" textAnchor="middle">Strong</text>
      <text x="424" y="276" fontFamily="Geist, system-ui" fontSize="10" fill="#6B7280" textAnchor="middle">Experience fit</text>

      <line x1="24" y1="302" x2="496" y2="302" stroke="#F0EDE6" strokeWidth="1"/>

      {/* Top fixes */}
      <text x="24" y="322" fontFamily="Geist, system-ui" fontSize="11" fontWeight="700" fill="#0C1A0E" letterSpacing="0.5">TOP FIXES</text>

      <rect x="24" y="332" width="472" height="52" rx="8" fill="#FAFAF9" stroke="#E0D8CC" strokeWidth="1"/>
      <text x="36" y="351" fontFamily="Geist, system-ui" fontSize="10.5" fontWeight="500" fill="#0C1A0E">Add CUDA and GPU kernel optimisation to skills</text>
      <text x="36" y="368" fontFamily="Geist, system-ui" fontSize="9.5" fill="#9CA3AF">Explicitly mention if applicable — specific requirement</text>
      <rect x="378" y="339" width="40" height="20" rx="10" fill="#DCFCE7"/>
      <text x="398" y="353" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#065F46" textAnchor="middle">+3pts</text>
      <rect x="424" y="339" width="60" height="20" rx="10" fill="#065F46"/>
      <text x="454" y="353" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="white" textAnchor="middle">Fix it</text>

      <rect x="24" y="392" width="472" height="52" rx="8" fill="#FAFAF9" stroke="#E0D8CC" strokeWidth="1"/>
      <text x="36" y="411" fontFamily="Geist, system-ui" fontSize="10.5" fontWeight="500" fill="#0C1A0E">Mention reinforcement learning from human feedback</text>
      <text x="36" y="428" fontFamily="Geist, system-ui" fontSize="9.5" fill="#9CA3AF">Add to skills section or a relevant experience bullet</text>
      <rect x="378" y="399" width="40" height="20" rx="10" fill="#DCFCE7"/>
      <text x="398" y="413" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#065F46" textAnchor="middle">+3pts</text>
      <rect x="424" y="399" width="60" height="20" rx="10" fill="#065F46"/>
      <text x="454" y="413" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="white" textAnchor="middle">Fix it</text>

      <line x1="24" y1="456" x2="496" y2="456" stroke="#F0EDE6" strokeWidth="1"/>

      {/* Matched keywords */}
      <text x="24" y="476" fontFamily="Geist, system-ui" fontSize="11" fontWeight="700" fill="#0C1A0E" letterSpacing="0.5">MATCHED KEYWORDS</text>

      <rect x="24" y="484" width="128" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="88" y="499" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Machine Learning</text>
      <rect x="160" y="484" width="64" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="192" y="499" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">PyTorch</text>
      <rect x="232" y="484" width="82" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="273" y="499" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">LLM Fine-tuning</text>
      <rect x="322" y="484" width="52" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="348" y="499" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">MLOps</text>
      <rect x="382" y="484" width="50" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="407" y="499" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Python</text>
      <rect x="440" y="484" width="56" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="468" y="499" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Vertex AI</text>

      <rect x="24" y="514" width="76" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="62" y="529" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Kubernetes</text>
      <rect x="108" y="514" width="82" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="149" y="529" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Transformers</text>
      <rect x="198" y="514" width="66" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="231" y="529" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">TensorFlow</text>

      {/* Missing */}
      <text x="24" y="554" fontFamily="Geist, system-ui" fontSize="11" fontWeight="700" fill="#0C1A0E" letterSpacing="0.5">MISSING</text>
      <rect x="24" y="562" width="50" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="49" y="577" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ CUDA</text>
      <rect x="82" y="562" width="50" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="107" y="577" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ RLHF</text>
    </svg>
  );
}
