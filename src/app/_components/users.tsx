"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { faker } from "@faker-js/faker";
import { User } from "../api/users/route";

function fetcher(url: string) {
  return fetch(url).then((res) => res.json());
}

function createUser(user: Omit<User, "id">) {
  return fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(user),
  }).then((res) => res.json());
}

export default function Users() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const queryClient = useQueryClient();
  
  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => fetcher("/api/users"),
  });
  
  const userMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser: User) => {
      queryClient.setQueryData(["users"], (users: User[]) => [
        newUser,
        ...users,
      ]);
      setCurrentUserIndex(0);
      queryClient.invalidateQueries({queryKey: ["users"]});
    },
  });

  const handleNextUser = () => {
    if (users.data && currentUserIndex < users.data.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    }
  };

  const handlePreviousUser = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
    }
  };

  if (users.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (users?.data?.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <div className="text-red-600 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-lg">Erro: {users.data.error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!users.data?.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 font-medium text-lg">Nenhum usuário encontrado</p>
        </div>
      </div>
    );
  }

  const currentUser = users.data[currentUserIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerenciador de Usuários</h1>
          <p className="text-gray-600">Demonstração do React Query</p>
        </div>

        {/* Add User Button */}
        <div className="text-center mb-8">
          <button
            onClick={() =>
              userMutation.mutate({
                fullName: faker.person.fullName(),
                email: faker.internet.email(),
              })
            }
            disabled={userMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {userMutation.isPending ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Usuário
              </span>
            )}
          </button>
        </div>

        {/* Current User Display */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentUser.fullName}</h2>
            <p className="text-gray-600 mb-4">{currentUser.email}</p>
            <div className="text-sm text-gray-500">
              Usuário {currentUserIndex + 1} de {users.data.length}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handlePreviousUser}
            disabled={currentUserIndex === 0}
            className="bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 font-semibold py-3 px-6 rounded-lg shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Usuário Anterior
          </button>
          
          <button
            onClick={handleNextUser}
            disabled={currentUserIndex === users.data.length - 1}
            className="bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 font-semibold py-3 px-6 rounded-lg shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed flex items-center"
          >
            Ver Usuário
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Todos os Usuários ({users.data.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {users.data.map((user: User, index: number) => (
              <div
                key={user.id}
                className={`p-4 border-b border-gray-50 last:border-b-0 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                  index === currentUserIndex ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                }`}
                onClick={() => setCurrentUserIndex(index)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-semibold text-white">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{user.fullName}</h4>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                  {index === currentUserIndex && (
                    <div className="text-indigo-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}