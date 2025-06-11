# app/models/todo.rb
class Todo < ApplicationRecord
  validates :title, presence: true, length: { minimum: 2 }
  validates :is_completed, inclusion: { in: [true, false] }
end
