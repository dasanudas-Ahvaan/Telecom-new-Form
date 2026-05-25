export function QuestionInput({ question, value, onChange }) {
  const baseClasses =
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border outline-none";

  return (
    <div>
      <label htmlFor={question.id} className="block text-sm font-medium  mb-1">
        {question.label}
      </label>
      {question.type === "textarea" ? (
        <textarea
          id={question.id}
          required
          rows={3}
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={question.id}
          type="text"
          required
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
