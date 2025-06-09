class TodosController < ApplicationController
  before_action :set_todo, only: [:show, :update, :destroy]
  def index
    @todos = Todo.all
    render json: @todos
  end

  def show
    render json: @todo
  end

  def create
    # Debugging: Log the incoming parameters and the new Todo object
    Rails.logger.debug "Received params: #{params.inspect}"
    @todo = Todo.new(todo_params)
    Rails.logger.debug "Todo object: #{@todo.inspect}"

    if @todo.save
      render json: @todo, status: :created
    else
      # Debugging: Log the errors if saving fails
      Rails.logger.debug "Todo errors: #{@todo.errors.full_messages}"
      render json: @todo.errors, status: :unprocessable_entity
    end
  end

  def update
    # Debugging: Log the incoming parameters and the updated Todo object
    Rails.logger.debug "Received params: #{params.inspect}"
    if @todo.update(todo_params)
      Rails.logger.debug "Updated todo object: #{@todo.inspect}"
      render json: @todo
    else
      # Debugging: Log the errors if updating fails
      Rails.logger.debug "Todo errors: #{@todo.errors.full_messages}"
      render json: @todo.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @todo.destroy
    head :no_content
  end

  private

  def set_todo
    @todo = Todo.find(params[:id])
  end

  def todo_params
    params.require(:todo).permit(:title, :is_completed)
  end
end
