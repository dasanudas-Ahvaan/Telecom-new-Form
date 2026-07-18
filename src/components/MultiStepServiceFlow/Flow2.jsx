import React, { useState } from "react";
import { StepOneSelection } from "./StepOneSelection";
import { StepTwoDetails } from "./StepTwoSubQuestions";

// --- MAIN PARENT COMPONENT ---
export default function MultiStepServiceFlow({ choices, onSubmit }) {
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // State for Step 2
  const [answers, setAnswers] = useState({});
  const [agreements, setAgreements] = useState({});

  const handleToggleChoice = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((choiceId) => choiceId !== id)
        : [...prev, id],
    );
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAgreementChange = (choiceId, isAgreed) => {
    setAgreements((prev) => ({ ...prev, [choiceId]: isAgreed }));
  };

  // Validation: Check if all selected choices have their terms agreed to
  const canSubmit =
    selectedIds.length > 0 && selectedIds.every((id) => agreements[id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (canSubmit) {
      onSubmit({ selectedIds, answers, agreements });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-left">
      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Header / Progress */}
        <header className="pb-4">
          <h2 className="text-xl font-semibold ">
            {step === 1
              ? "Step 1: Select Your Services"
              : "Step 2: Details & Agreements"}
          </h2>
          <div className="flex gap-2 mt-3">
            <div
              className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <div
              className={`h-2 flex-1 rounded-full ${step === 2 ? "bg-blue-600" : "bg-gray-200"}`}
            />
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className="">
          {step === 1 ? (
            <StepOneSelection
              choices={choices}
              selectedIds={selectedIds}
              onToggle={handleToggleChoice}
            />
          ) : (
            <>
              <StepTwoDetails
                selectedChoices={choices.filter((c) =>
                  selectedIds.includes(c._id),
                )}
                answers={answers}
                agreements={agreements}
                onAnswerChange={handleAnswerChange}
                onAgreementChange={handleAgreementChange}
              />
            </>
          )}
        </main>

        {/* Footer Controls */}
        <footer className="px-6 py-4 flex justify-between items-center">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 font-medium hover:border rounded-lg transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {/* Empty div for flexbox spacing if no back button */}
          <button
            type="submit"
            disabled={step === 1 ? selectedIds.length === 0 : !canSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer ml-auto"
          >
            {step === 1 ? "Continue to Details" : "Confirm & Submit"}
          </button>
        </footer>
      </form>
    </div>
  );
}
