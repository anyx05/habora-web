import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useCurrentPortId } from './berths';

export interface AgentSettings {
  systemPrompt: string;
  language: string;
}

export function useAgentSettings() {
  const { data: portId } = useCurrentPortId();
  
  return useQuery({
    queryKey: ['agent_settings', portId],
    enabled: !!portId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('agent_settings')
        .select('system_prompt, language_hint')
        .eq('port_id', portId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // If no settings exist yet, return defaults
          return {
            systemPrompt: "You are Habora...",
            language: "en"
          } as AgentSettings;
        }
        throw new Error(error.message);
      }
      
      return {
        systemPrompt: data.system_prompt,
        language: data.language_hint
      } as AgentSettings;
    }
  });
}

export function useUpdateAgentSettings() {
  const queryClient = useQueryClient();
  const { data: portId } = useCurrentPortId();

  return useMutation({
    mutationFn: async (settings: AgentSettings) => {
      if (!portId) throw new Error("No port ID available");
      const supabase = createClient();
      
      // Upsert logic (requires port_id to be unique constraint, which it is)
      const { data, error } = await supabase
        .from('agent_settings')
        .upsert({
          port_id: portId,
          system_prompt: settings.systemPrompt,
          language_hint: settings.language
        }, { onConflict: 'port_id' })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent_settings'] });
    }
  });
}
