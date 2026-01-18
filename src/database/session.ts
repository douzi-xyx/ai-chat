import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// 根据id获取会话
export async function getSessionById(id: string, client?: SupabaseClient) {
  const db = client || supabase;
  const {data, error} = await db.from('sessions').select('*').eq('id', id).single();
  if (error) {
    throw new Error(`获取会话失败: ${error.message}`);
  }

  return data || null;
}

// 创建会话
export async function createSession(id: string, name: string, client?: SupabaseClient) {
  const db = client || supabase;
  const {error} =await db.from('sessions').insert({
    id, name
  })

  if (error) {
    throw new Error(`创建会话失败: ${error.message}`);
  }

  // return getSessionById(id);
}

// 获取所有会话
export async function getAllSessions(client?: SupabaseClient) {
  const db = client || supabase;
  const { data, error } = await db.from('sessions').select('*').order('created_at', { ascending: false });
  if (error) {
    throw new Error(`获取会话列表失败: ${error.message}`);
  }

  return data || [];
}

// 更新会话
export async function updateSession(id: string, name: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ name })
    .eq('id', id);

  if (error) {
    throw new Error(`更新会话名称失败: ${error.message}`);
  }
}

// 删除会话
export async function deleteSession(id: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`删除会话失败: ${error.message}`);
  }
}
