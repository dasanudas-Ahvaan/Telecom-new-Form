import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";
import Search from "../components/Search";
import { getAllMembers } from "../api/Admin";
import useDebounce from "../hooks/useDebounce";
import MemberTable from "../components/MemberTable";
import ViewMember from "../components/RightSideBar/ViewMember";
import EditMember from "../components/RightSideBar/EditMember";

const Dashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 800).toLowerCase();
  const { token, user } = useAuth();

  const filteredMembers = debouncedSearch
    ? members.filter(
        (member) =>
          member?.fullName?.toLowerCase().includes(debouncedSearch) ||
          member?.email?.toLowerCase().includes(debouncedSearch)
      )
    : members;
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getAllMembers(token, user._id);
        if (response.success) setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error.message);
      }
    };

    fetchMembers();
  }, [token]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState({ view: false, member: null });
  const [selectedMember, setSelectedMember] = useState(null);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedMember(null);
  };

  const handleEditMember = (currentMember) => {
    // Implement edit member logic here
    setIsEditOpen({ view: true, member: currentMember });
  };

  const handleMemberUpdate = (updatedMember) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id ? updatedMember : m))
    );
  };

  const handleMemberDelete = (deletedMemberId) => {
    setMembers((prev) => prev.filter((m) => m._id !== deletedMemberId));
  };
  return (
    <div className="bg-blue-300 w-screen">
      <Search value={search} setSearch={setSearch} />
      <div>
        <button
          className="rounded-lg whitespace-nowrap font-medium text-base py-2 px-5 border-2 hover:border-blue-800 cursor-pointer text-blue-200 bg-blue-700"
          onClick={() => navigate("/dashboard/field")}
        >
          Manage Custom Fields
        </button>
      </div>
      {filteredMembers && filteredMembers.length > 0 && (
        <MemberTable members={filteredMembers} onView={handleViewMember} />
      )}

      <ViewMember
        isOpen={isViewOpen}
        onClose={handleCloseView}
        member={selectedMember}
        handleEdit={handleEditMember}
      />

      <EditMember
        isOpen={isEditOpen.view}
        onClose={() => setIsEditOpen({ view: false, member: null })}
        member={isEditOpen.member}
        onUpdate={handleMemberUpdate}
        onDelete={handleMemberDelete}
      />
    </div>
  );
};

export default Dashboard;
