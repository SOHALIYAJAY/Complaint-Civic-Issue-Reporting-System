# Dashboard API Service

This service handles all API calls for the admin dashboard data fetching from Django backend.

## Backend Integration

### Django View
The frontend connects to the `admindashboardcard` Django view:

```python
class admindashboardcard(APIView):
    def get(self, request):
        total_comp = Complaint.objects.all().count()
        total_dept = Department.objects.all().count()
        resolved_comp = Complaint.objects.filter(status='resolved').count()
        sla_compliance = (resolved_comp / total_comp * 100) if total_comp > 0 else 0

        return Response({
            'total_comp': total_comp,
            'total_dept': total_dept,
            'sla_compliance': round(sla_compliance, 1)
        })
```

### API Endpoint
- **URL**: `/api/admindashboardcard/` (uses configured API base URL)
- **Method**: GET
- **Response Format**:
```json
{
  "total_comp": 150,
  "total_dept": 5,
  "sla_compliance": 85.5
}
```

## Frontend Data Transformation

The backend response is transformed into 4 KPI cards:

1. **Total Complaints** - Direct from `total_comp`
2. **Total Departments** - Direct from `total_dept`
3. **Resolved Complaints** - Calculated: `total_comp * (sla_compliance / 100)`
4. **SLA Compliance** - Direct from `sla_compliance` with % symbol

## Available Functions

### KPI Data
- `getDashboardKPIs()` - Fetches and transforms backend data to KPI format
- `refreshDashboardData()` - Refreshes all dashboard data simultaneously

### Individual Endpoints
- `getDashboardStats()` - Fetches raw backend response
- `getRecentComplaints()` - Fetches recent complaints list (future)
- `getDepartmentPerformance()` - Fetches department performance metrics (future)

## Data Structures

### BackendDashboardResponse
```typescript
interface BackendDashboardResponse {
  total_comp: number
  total_dept: number
  sla_compliance: number
}
```

### DashboardKPI
```typescript
interface DashboardKPI {
  title: string
  value: string
  trend: string
  trendUp: boolean
  badge: string
  bgColor: string
  borderColor: string
  textColor: string
}
```

## Usage Example

```typescript
import { getDashboardKPIs } from '../../services/dashboardService'

// In your component
const [kpis, setKpis] = useState<DashboardKPI[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchKPIs = async () => {
    try {
      const data = await getDashboardKPIs()
      setKpis(data)
    } catch (error) {
      console.error('Failed to fetch KPIs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchKPIs()
}, [])
```

## Error Handling

- **API Failures**: Falls back to mock data to ensure UI doesn't break
- **Network Issues**: Shows error messages to users
- **Data Transformation**: Handles backend data format changes gracefully

## Debugging

Check browser console for:
- `Fetching dashboard KPIs from backend...`
- `Received KPI data: [data]`
- Any API errors with detailed messages

## Django URLs Configuration

Make sure your Django `urls.py` includes:

```python
from django.urls import path
from .views import admindashboardcard

urlpatterns = [
    path('api/admindashboardcard/', admindashboardcard.as_view()),
    # ... other urls
]
```
