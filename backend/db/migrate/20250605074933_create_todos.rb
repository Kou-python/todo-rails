class CreateTodos < ActiveRecord::Migration[8.0]
  def change
    create_table :todos do |t|
      t.string :title
      t.boolean :is_completed

      t.timestamps # これだけでcreated_atとupdated_atの両方が追加されます
    end
  end
end
