import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function BudgetTracker() {
  const { user } = useAuth();
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyBudget] = useState(500); // Default budget
  const [completedNeeds, setCompletedNeeds] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchSpending = async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: needs } = await supabase
        .from('needs')
        .select('estimated_price_cents, status')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (needs) {
        const spent = needs
          .filter((need) => need.status === 'completed')
          .reduce((sum, need) => sum + need.estimated_price_cents, 0);
        
        setTotalSpent(spent / 100);
        setCompletedNeeds(needs.filter((need) => need.status === 'completed').length);
      }
    };

    fetchSpending();
  }, [user]);

  const percentageUsed = (totalSpent / monthlyBudget) * 100;
  const isOverBudget = totalSpent > monthlyBudget;
  const remaining = monthlyBudget - totalSpent;

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase">Budget Tracker</h3>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>
        {isOverBudget ? (
          <TrendingUp className="w-5 h-5 text-destructive" />
        ) : (
          <TrendingDown className="w-5 h-5 text-green-500" />
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">of ${monthlyBudget.toFixed(2)}</span>
          </div>
          <Progress 
            value={Math.min(percentageUsed, 100)} 
            className="h-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className={`text-lg font-bold ${remaining < 0 ? 'text-destructive' : 'text-green-500'}`}>
              ${Math.abs(remaining).toFixed(2)}
            </p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-lg font-bold text-foreground">{completedNeeds} needs</p>
          </div>
        </div>

        {isOverBudget && (
          <div className="glass-card rounded-xl p-3 bg-destructive/10 border border-destructive/30">
            <p className="text-xs font-semibold text-destructive">
              ⚠️ Over budget by ${(totalSpent - monthlyBudget).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
