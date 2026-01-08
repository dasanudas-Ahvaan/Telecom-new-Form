import React from "react";

const MemberTable = ({ members, onView }) => {
  return (
    /* 1. Removed dark gray backgrounds, switched to transparent 
       2. Added glassmorphism effect to the container */
    <div className="w-full py-2 my-2 overflow-x-auto bg-transparent">
      <div className="min-w-max mx-auto bg-white/40 backdrop-blur-md rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-[900px] w-full border-collapse text-left">
          <thead>
            {/* Header: Clean white background with bold black text */}
            <tr className="bg-white/90 text-black border-b-2 border-gray-200">
              <th className="p-4 font-bold uppercase text-xs tracking-wider">S.No.</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider">Name</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider">Email</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider">Profession</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider">Verified</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider">Active</th>
            </tr>
          </thead>

          <tbody className="bg-white/60">
            {members.map((member, index) => (
              <tr
                key={member._id}
                className="border-b border-gray-200 hover:bg-white/80 transition-colors cursor-pointer group"
                onClick={() => onView(member)}
              >
                {/* All cell text set to black */}
                <td className="p-4 text-black font-medium">{index + 1}</td>
                <td className="p-4 text-black font-semibold group-hover:text-blue-700">{member.fullName}</td>
                <td className="p-4 text-black">{member.email}</td>
                <td className="p-4 text-black capitalize">{member.profession}</td>

                {/* Verified badge - kept colors for clarity but brightened them */}
                <td className="p-4">
                  {member.isVerified ? (
                    <span className="px-3 py-1 text-xs font-bold bg-green-200 text-green-800 rounded-full uppercase">
                      Yes
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold bg-red-200 text-red-800 rounded-full uppercase">
                      No
                    </span>
                  )}
                </td>

                {/* Active badge */}
                <td className="p-4">
                  {member.status === "active" ? (
                    <span className="px-3 py-1 text-xs font-bold bg-blue-200 text-blue-800 rounded-full uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold bg-gray-200 text-gray-800 rounded-full uppercase">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;