json.array!(@projects) do |project|
  json.extract! project, :id, :name, :description, :price, :due_date, :is_active
  json.url project_url(project, format: :json)
end
