import { Book, ChartLine, Share, User } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const stats = [
    { label: "Total Repositories", value: "12", icon: Book },
    { label: "Success Rate", value: "87%", icon: ChartLine },
    { label: "Shared With", value: "48", icon: Share },
    { label: "Active Users", value: "156", icon: User },
  ];

  return (
    <div className="min-h-screen pt-16 pb-12 flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center animate-in">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to SalesRepo
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your personal repository for sales success. Create, manage, and share
              your sales strategies with ease.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card relative rounded-2xl px-6 py-8 overflow-hidden"
                >
                  <div className="absolute right-2 top-2 text-primary/20">
                    <stat.icon className="h-12 w-12" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-4 rounded-lg bg-white/50 border border-gray-100"
                  >
                    <div className="flex-shrink-0">
                      <Book className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        New repository created
                      </p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;