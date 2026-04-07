export default function AtsAnalysisVisual() {
  return (
    <svg width="536" height="596" viewBox="-8 -8 536 596" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="520" height="580" rx="16" fill="white" stroke="#E0D8CC" strokeWidth="1"/>
      <text x="24" y="36" fontFamily="Geist, system-ui" fontSize="13" fontWeight="600" fill="#0C1A0E">ATS Analysis</text>
      <text x="440" y="36" fontFamily="Geist, system-ui" fontSize="11" fill="#9CA3AF">8m ago</text>
      <line x1="24" y1="48" x2="496" y2="48" stroke="#F0EDE6" strokeWidth="1"/>

      {/* Score ring */}
      <circle cx="260" cy="140" r="72" stroke="#E8F5F0" strokeWidth="10" fill="none"/>
      <circle cx="260" cy="140" r="72" stroke="#065F46" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="403 450" strokeDashoffset="112" transform="rotate(-90 260 140)"/>
      <text x="260" y="132" fontFamily="Geist, system-ui" fontSize="36" fontWeight="800" fill="#065F46" textAnchor="middle">89</text>
      <text x="260" y="152" fontFamily="Geist, system-ui" fontSize="11" fill="#6B7280" textAnchor="middle">ATS Score</text>

      {/* Interview Ready chip */}
      <rect x="188" y="224" width="144" height="26" rx="13" fill="#065F46"/>
      <text x="260" y="241" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="white" textAnchor="middle">Interview Ready</text>

      {/* Score Breakdown */}
      <text x="24" y="278" fontFamily="Geist, system-ui" fontSize="11" fontWeight="700" fill="#0C1A0E" letterSpacing="0.5">SCORE BREAKDOWN</text>

      {/* Contact Info 100% */}
      <text x="24" y="305" fontFamily="Geist, system-ui" fontSize="12" fill="#3D3830">Contact Info</text>
      <rect x="200" y="293" width="264" height="7" rx="3.5" fill="#F0EDE6"/>
      <rect x="200" y="293" width="264" height="7" rx="3.5" fill="#065F46"/>
      <text x="494" y="304" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="#065F46" textAnchor="end">100</text>

      {/* Keywords 92% */}
      <text x="24" y="330" fontFamily="Geist, system-ui" fontSize="12" fill="#3D3830">Keywords</text>
      <rect x="200" y="318" width="264" height="7" rx="3.5" fill="#F0EDE6"/>
      <rect x="200" y="318" width="243" height="7" rx="3.5" fill="#065F46"/>
      <text x="494" y="329" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="#065F46" textAnchor="end">92</text>

      {/* Required Sections 100% */}
      <text x="24" y="355" fontFamily="Geist, system-ui" fontSize="12" fill="#3D3830">Required Sections</text>
      <rect x="200" y="343" width="264" height="7" rx="3.5" fill="#F0EDE6"/>
      <rect x="200" y="343" width="264" height="7" rx="3.5" fill="#065F46"/>
      <text x="494" y="354" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="#065F46" textAnchor="end">100</text>

      {/* Bullet Quality 90% */}
      <text x="24" y="380" fontFamily="Geist, system-ui" fontSize="12" fill="#3D3830">Bullet Quality</text>
      <rect x="200" y="368" width="264" height="7" rx="3.5" fill="#F0EDE6"/>
      <rect x="200" y="368" width="238" height="7" rx="3.5" fill="#065F46"/>
      <text x="494" y="379" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="#065F46" textAnchor="end">90</text>

      {/* Measurable Results 80% */}
      <text x="24" y="405" fontFamily="Geist, system-ui" fontSize="12" fill="#3D3830">Measurable Results</text>
      <rect x="200" y="393" width="264" height="7" rx="3.5" fill="#F0EDE6"/>
      <rect x="200" y="393" width="211" height="7" rx="3.5" fill="#34D399"/>
      <text x="494" y="404" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="#34D399" textAnchor="end">80</text>

      {/* Formatting 100% */}
      <text x="24" y="430" fontFamily="Geist, system-ui" fontSize="12" fill="#3D3830">Formatting</text>
      <rect x="200" y="418" width="264" height="7" rx="3.5" fill="#F0EDE6"/>
      <rect x="200" y="418" width="264" height="7" rx="3.5" fill="#065F46"/>
      <text x="494" y="429" fontFamily="Geist, system-ui" fontSize="11" fontWeight="600" fill="#065F46" textAnchor="end">100</text>

      <line x1="24" y1="450" x2="496" y2="450" stroke="#F0EDE6" strokeWidth="1"/>

      {/* Missing Keywords */}
      <text x="24" y="472" fontFamily="Geist, system-ui" fontSize="11" fontWeight="700" fill="#0C1A0E" letterSpacing="0.5">MISSING KEYWORDS</text>
      <rect x="24" y="480" width="46" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="47" y="495" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ SQL</text>
      <rect x="78" y="480" width="40" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="98" y="495" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ Git</text>
      <rect x="126" y="480" width="98" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="175" y="495" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ Stat. Modeling</text>
      <rect x="232" y="480" width="40" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="252" y="495" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ dbt</text>
      <rect x="280" y="480" width="104" height="22" rx="11" fill="white" stroke="#DC2626" strokeWidth="1.5"/>
      <text x="332" y="495" fontFamily="Geist, system-ui" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle">+ Computer Vision</text>

      <line x1="24" y1="512" x2="496" y2="512" stroke="#F0EDE6" strokeWidth="1"/>

      {/* Found Keywords */}
      <text x="24" y="532" fontFamily="Geist, system-ui" fontSize="11" fontWeight="700" fill="#0C1A0E" letterSpacing="0.5">FOUND KEYWORDS</text>
      <rect x="24" y="540" width="52" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="50" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Python</text>
      <rect x="84" y="540" width="98" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="133" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Machine Learning</text>
      <rect x="190" y="540" width="66" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="223" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">TensorFlow</text>
      <rect x="264" y="540" width="56" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="292" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">PyTorch</text>
      <rect x="328" y="540" width="38" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="347" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">SQL</text>
      <rect x="374" y="540" width="50" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="399" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">MLOps</text>
      <rect x="432" y="540" width="46" height="22" rx="11" fill="white" stroke="#065F46" strokeWidth="1.5"/>
      <text x="455" y="555" fontFamily="Geist, system-ui" fontSize="9" fontWeight="500" fill="#065F46" textAnchor="middle">Docker</text>

      <text x="260" y="577" fontFamily="Geist, system-ui" fontSize="10" fill="#9CA3AF" textAnchor="middle">Scores are AI-generated estimates</text>
    </svg>
  );
}
