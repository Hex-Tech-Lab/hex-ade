import { http, HttpResponse } from 'msw'

// Mock API handlers for testing
export const handlers = [
  // Mock project API
  http.get('/api/projects', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        projects: [
          { id: '1', name: 'Test Project', path: '/test', has_spec: true },
        ],
      },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    })
  }),

  // Mock features API
  http.get('/api/projects/:projectId/features', ({ params }) => {
    const projectId = params.projectId as string

    return HttpResponse.json({
      status: 'success',
      data: {
        pending: [{ id: 1, name: 'Feature 1', category: 'test', passes: false, in_progress: false }],
        in_progress: [],
        done: [{ id: 2, name: 'Feature 2', category: 'test', passes: true, in_progress: false }],
      },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    })
  }),

  // Mock agent status API
  http.get('/api/projects/:projectId/agent/status', ({ params }) => {
    return HttpResponse.json({
      status: 'success',
      data: {
        status: 'stopped',
        pid: null,
        started_at: null,
        yolo_mode: false,
        max_concurrency: 3,
        testing_agent_ratio: 1,
      },
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    })
  }),
]