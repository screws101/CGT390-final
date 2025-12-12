interface GpaCardProps {
  gpa: number
}

export default function GpaCard({ gpa }: GpaCardProps) {
  return (
    <div className="card">
      <h3 className="gpa-title">Overall GPA</h3>
      <div className="gpa-value">
        {gpa.toFixed(2)}
      </div>
    </div>
  )
}


