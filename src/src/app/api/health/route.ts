// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asumiendo que tienes un cliente Prisma centralizado

export async function GET() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  // 1. Check Environment Variables
  const envCheck = {
    openRouter: {
      exists: !!openRouterApiKey,
      length: openRouterApiKey?.length,
    },
    // ... otros checks de variables
  };

  // 2. Check Database Connectivity
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'error';
  }

  // 3. Check OpenRouter API Connectivity
  let openRouterStatus = 'ok';
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
      },
    });
    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    openRouterStatus = 'error';
  }

  const overallStatus = 
    dbStatus === 'ok' && openRouterStatus === 'ok' && envCheck.openRouter.exists 
    ? 200 
    : 503; // Service Unavailable

  return NextResponse.json(
    {
      status: overallStatus === 200 ? 'ok' : 'service_unavailable',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
        openRouter: openRouterStatus,
      },
      environment: envCheck,
    },
    { status: overallStatus }
  );
}