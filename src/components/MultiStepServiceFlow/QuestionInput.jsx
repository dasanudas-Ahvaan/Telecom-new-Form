export function QuestionInput({ question, value, questionNumber, onChange }) {
  const baseClasses =
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border outline-none";

  return (
    <div>
      <label htmlFor={question.id} className="block text-sm font-medium  mb-1">
        {questionNumber}. {question.label}
      </label>
      {question.type === "textarea" && (
        <textarea
          id={question.id}
          required
          rows={3}
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="max 300 words"
        />
      )}
      {question.type === "text" && (
        <input
          id={question.id}
          type="text"
          required
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {question.type === "options" && (
        <select
          id={question.id}
          required
          className={`bg-black text-white p-1 rounded`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option</option>

          {question.options.map((op, index) => (
            <option key={index} value={op}>
              {op}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
