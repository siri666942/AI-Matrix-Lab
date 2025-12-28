// Supabase客户端配置（占位文件）
// 本应用不需要数据库功能

// 创建一个模拟的supabase对象以满足AuthContext的需求
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: new Error('未配置Supabase') }),
    signUp: async () => ({ error: new Error('未配置Supabase') }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null }),
      }),
    }),
  }),
} as any;
