import React, { useEffect, useState } from 'react';
import { Brain, Database, Palette, CheckCircle, Loader2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.FC<any>;
  status: 'waiting' | 'working' | 'completed';
  message: string;
}

interface AIAgentProgressProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const AIAgentProgress: React.FC<AIAgentProgressProps> = ({ isActive, onComplete }) => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'analyst',
      name: 'Data Analyst AI',
      role: 'Analyzing query & patterns',
      icon: Brain,
      status: 'waiting',
      message: 'Understanding your business question...'
    },
    {
      id: 'engineer',
      name: 'Data Engineer AI',
      role: 'Processing & aggregating data',
      icon: Database,
      status: 'waiting',
      message: 'Optimizing data pipelines...'
    },
    {
      id: 'designer',
      name: 'UX Designer AI',
      role: 'Creating visualizations',
      icon: Palette,
      status: 'waiting',
      message: 'Designing executive-ready charts...'
    }
  ]);

  useEffect(() => {
    if (!isActive) {
      // Reset all agents to waiting
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'waiting' })));
      return;
    }

    // Simulate agents working in sequence
    const timers: NodeJS.Timeout[] = [];

    // Data Analyst starts immediately
    timers.push(setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === 'analyst' 
          ? { ...agent, status: 'working', message: 'Interpreting business context...' }
          : agent
      ));
    }, 100));

    // Data Analyst completes, Engineer starts
    timers.push(setTimeout(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.id === 'analyst') return { ...agent, status: 'completed', message: 'Query analysis complete!' };
        if (agent.id === 'engineer') return { ...agent, status: 'working', message: 'Building SQL queries...' };
        return agent;
      }));
    }, 800));

    // Engineer progresses
    timers.push(setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === 'engineer' 
          ? { ...agent, message: 'Aggregating metrics...' }
          : agent
      ));
    }, 1200));

    // Engineer completes, Designer starts
    timers.push(setTimeout(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.id === 'engineer') return { ...agent, status: 'completed', message: 'Data pipeline ready!' };
        if (agent.id === 'designer') return { ...agent, status: 'working', message: 'Selecting optimal chart type...' };
        return agent;
      }));
    }, 1600));

    // Designer progresses
    timers.push(setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === 'designer' 
          ? { ...agent, message: 'Applying visual best practices...' }
          : agent
      ));
    }, 2000));

    // All complete
    timers.push(setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === 'designer' 
          ? { ...agent, status: 'completed', message: 'Visualization ready!' }
          : agent
      ));
      onComplete?.();
    }, 2400));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          <div className="relative">
            <h3 className="text-2xl font-bold mb-2 flex items-center">
              <span className="mr-3">🤖</span>
              AI Agent Collaboration
              <div className="ml-3 flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-400"></div>
              </div>
            </h3>
            <p className="text-brand-100">Multiple specialized AIs working together to deliver insights</p>
          </div>
        </div>

        {/* Agents */}
        <div className="p-6 space-y-6">
          {agents.map((agent, index) => (
            <div key={agent.id} className={`
              relative transition-all duration-500 
              ${agent.status === 'waiting' ? 'opacity-50' : 'opacity-100'}
              ${agent.status === 'working' ? 'scale-105' : 'scale-100'}
            `}>
              {/* Connection line */}
              {index < agents.length - 1 && (
                <div className={`
                  absolute left-10 top-20 w-0.5 h-16 transition-all duration-500
                  ${agents[index + 1].status !== 'waiting' 
                    ? 'bg-gradient-to-b from-brand-500 to-brand-300' 
                    : 'bg-gray-200'}
                `} />
              )}

              <div className={`
                relative flex items-start space-x-4 p-4 rounded-xl transition-all duration-300
                ${agent.status === 'working' 
                  ? 'bg-gradient-to-r from-brand-50 to-accent-50 border-2 border-brand-300 shadow-lg shadow-brand-200/50' 
                  : agent.status === 'completed'
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-gray-50 border-2 border-gray-200'}
              `}>
                {/* Icon */}
                <div className={`
                  relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform
                  ${agent.status === 'working' 
                    ? 'bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 animate-pulse scale-110 rotate-3' 
                    : agent.status === 'completed'
                    ? 'bg-gradient-to-br from-green-500 to-green-600 scale-105'
                    : 'bg-gray-300 scale-95'}
                `}>
                  {agent.status === 'working' ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : agent.status === 'completed' ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <agent.icon className="w-8 h-8 text-white" />
                  )}
                  
                  {/* Pulse effect for working state */}
                  {agent.status === 'working' && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-20" />
                      <div className="absolute inset-0 rounded-full bg-brand-400 animate-ping animation-delay-200 opacity-20" />
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold transition-colors duration-300 ${
                      agent.status === 'working' ? 'text-brand-700' : 
                      agent.status === 'completed' ? 'text-green-700' : 
                      'text-gray-700'
                    }`}>
                      {agent.name}
                    </h4>
                    {agent.status === 'completed' && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{agent.role}</p>
                  <p className={`text-sm font-medium transition-all duration-300 ${
                    agent.status === 'working' ? 'text-brand-600 animate-pulse' : 
                    agent.status === 'completed' ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {agent.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${agents.filter(a => a.status === 'completed').length / agents.length * 100}%` 
              }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {agents.filter(a => a.status === 'completed').length} of {agents.length} agents completed
          </p>
        </div>
      </div>
    </div>
  );
};