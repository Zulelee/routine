"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTeamMemberDialog } from "@/components/create-team-member-dialog";
import { EditTeamMemberDialog } from "@/components/edit-team-member-dialog";
import { AssignToProjectDialog } from "@/components/assign-to-project-dialog";
import { Navigation } from "@/components/navigation";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
  project_assignments: ProjectAssignment[];
}

interface ProjectAssignment {
  id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  hourly_rate: number;
  payment_type: string;
  payment_amount: number;
  payment_status: string;
  joined_date: string;
  left_date?: string;
  is_active: boolean;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [assigningMember, setAssigningMember] = useState<TeamMember | null>(
    null
  );

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, searchTerm, statusFilter]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team-members");
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((member) =>
        statusFilter === "active" ? member.is_active : !member.is_active
      );
    }

    setFilteredMembers(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleMemberCreated = (newMember: TeamMember) => {
    setTeamMembers([newMember, ...teamMembers]);
    setShowCreateDialog(false);
  };

  const handleMemberUpdated = (updatedMember: TeamMember) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    setEditingMember(null);
  };

  const handleMemberDeleted = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  const handleAssignmentCreated = (
    memberId: string,
    newAssignment: ProjectAssignment
  ) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              project_assignments: [
                ...member.project_assignments,
                newAssignment,
              ],
            }
          : member
      )
    );
    setAssigningMember(null);
  };

  const handlePaymentStatusUpdate = async (
    assignmentId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/projects/members/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (response.ok) {
        // Update the local state
        setTeamMembers(
          teamMembers.map((member) => ({
            ...member,
            project_assignments: member.project_assignments.map((assignment) =>
              assignment.id === assignmentId
                ? { ...assignment, payment_status: newStatus }
                : assignment
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  if (loading) {
    return (
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navigation />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
              <p className="mt-2 text-gray-600">
                Manage your team members and their project assignments
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Members</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Team Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No team members found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding your first team member."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {member.email}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            member.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Role:</span>
                        <span className="font-medium">{member.role}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hourly Rate:</span>
                        <span className="font-medium">
                          {formatCurrency(member.hourly_rate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Joined:</span>
                        <span>{formatDate(member.created_at)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Active Projects:
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {member.project_assignments?.filter(
                            (a) => a.is_active
                          ).length || 0}
                        </Badge>
                      </div>
                      {member.project_assignments
                        ?.filter((a) => a.is_active)
                        .map((assignment: any) => (
                          <div
                            key={assignment.id}
                            className="bg-gray-50 p-3 rounded text-sm mb-2"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">
                                {assignment.project_name}
                              </div>
                              <div className="flex gap-1">
                                {assignment.payment_type === "fixed_budget" ? (
                                  <Badge
                                    className={
                                      assignment.payment_status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : assignment.payment_status ===
                                          "overdue"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }
                                  >
                                    {assignment.payment_status}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    {formatCurrency(assignment.hourly_rate)}/hr
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-gray-600 text-xs">
                              {assignment.client_name}
                            </div>
                            {assignment.payment_type === "fixed_budget" && (
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-500 text-xs">
                                  {formatCurrency(assignment.payment_amount)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6 px-2"
                                  onClick={() =>
                                    handlePaymentStatusUpdate(
                                      assignment.id,
                                      assignment.payment_status === "paid"
                                        ? "pending"
                                        : "paid"
                                    )
                                  }
                                >
                                  {assignment.payment_status === "paid"
                                    ? "Mark Unpaid"
                                    : "Mark Paid"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMember(member)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssigningMember(member)}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMemberDeleted(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <CreateTeamMemberDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onMemberCreated={handleMemberCreated}
        />

        {editingMember && (
          <EditTeamMemberDialog
            open={!!editingMember}
            onOpenChange={() => setEditingMember(null)}
            member={editingMember}
            onMemberUpdated={handleMemberUpdated}
          />
        )}

        {assigningMember && (
          <AssignToProjectDialog
            open={!!assigningMember}
            onOpenChange={() => setAssigningMember(null)}
            member={assigningMember}
            onAssignmentCreated={(assignment) =>
              handleAssignmentCreated(assigningMember.id, assignment)
            }
          />
        )}
      </main>
    </>
  );
}
