=begin
require 'rails_helper'

RSpec.describe Todo, type: :model do
  it 'is valid with valid attributes' do
    todo = Todo.new(title: 'Test Todo', completed: false)
    expect(todo).to be_valid
  end

  it 'is not valid without a title' do
    todo = Todo.new(title: nil)
    expect(todo).to_not be_valid
  end

  it 'is not valid with a title that is too short' do
    todo = Todo.new(title: 'a')
    expect(todo).to_not be_valid
  end
end
=end
